# AWS dev deployment

This document describes the durable AWS and Kubernetes design for the development environment. Keep session-specific commands, deployment checkpoints, and troubleshooting in the deployment chat or CI workflow.

## Ownership

| Tool | Owns |
| --- | --- |
| Terraform | AWS network, EC2, EBS, Elastic IP, Route 53, ECR, RDS, S3, IAM, and EC2 power state |
| Helm | Kubernetes releases and their configuration |
| k3s | Kubernetes control plane and kubelet on the EC2 instance |

Terraform state is stored in the private, versioned S3 bucket created by [`infra/bootstrap`](../infra/bootstrap). The dev stack state key is `dev/terraform.tfstate`.

## AWS environment

The `llp-dev` AWS profile deploys regional resources in `eu-north-1`. [`infra/environments/dev`](../infra/environments/dev) creates one public-subnet VPC and one Amazon Linux 2023 Arm64 instance.

The instance has a 30 GB encrypted gp3 root volume, an SSM instance role, and no SSH ingress. It can be stopped with Terraform without removing the EBS volume, Elastic IP, DNS records, or ECR repositories. A change to [`k3s-user-data.sh`](../infra/environments/dev/k3s-user-data.sh) replaces the instance because `user_data_replace_on_change` is enabled.

The latest Amazon Linux AMI is selected when creating a node. AMI changes are ignored for an existing instance, so routine applies do not rebuild k3s when AWS publishes a new image. OS patching and deliberate image rebuilds are separate maintenance work.

The security group exposes these ports:

| Port | Protocol | Purpose |
| --- | --- | --- |
| 80 | TCP | HTTP and ACME HTTP-01 challenges |
| 443 | TCP | HTTPS and LiveKit signaling |
| 7881 | TCP | LiveKit RTC fallback |
| 50000–50020 | UDP | LiveKit media |

Kubernetes API port 6443 and SSH stay private.

## Public names

Terraform owns a Route 53 hosted zone for the registered apex in `domain_name`, then delegates that zone from the registrar. `environment_label` defaults to `dev`.

| Terraform output | Current hostname pattern | Purpose |
| --- | --- | --- |
| `app_fqdn` | `<environment>.app.<domain>` | Browser application origin |
| `media_fqdn` | `<environment>.media.<domain>` | LiveKit browser signaling |

For this environment the names are `dev.app.lang-platform.online` and `dev.media.lang-platform.online`. Both A records target the Elastic IP, which remains allocated while the instance is stopped.

## Kubernetes access

k3s is installed during first boot with Traefik disabled. It writes the administrator kubeconfig to the encrypted SSM parameter `/llp/dev/kubeconfig`. The kubeconfig points at `127.0.0.1:6443`; a local Session Manager port-forward exposes that address to `kubectl` and Helm without opening the API to the internet.

## Container images

`frontend` and `backend` are private ECR repositories. The EC2 role can obtain an ECR authorization token and pull image layers only from those two repositories.

kubelet uses the ECR credential-provider plugin at pull time. It runs on the host and uses the EC2 instance role through IMDS, so Kubernetes workloads do not use `imagePullSecrets` or a token-refresh CronJob. The plugin binary and configuration live under `/var/lib/rancher/credentialprovider/`; they must be restored when the instance is replaced.

## Public ingress and TLS

When installed, [`helm/ingress-nginx/values.yaml`](../helm/ingress-nginx/values.yaml) configures ingress-nginx as a host-network DaemonSet. It receives ports 80 and 443 directly on the node. Its Kubernetes Service is `ClusterIP`, so the stack does not create an AWS load balancer.

cert-manager is an upstream Helm release. [`helm/cert-manager-issuer`](../helm/cert-manager-issuer) defines the `letsencrypt-public` `ClusterIssuer`, which uses Let's Encrypt's production service to issue browser-trusted certificates. It uses ACME HTTP-01 through the `nginx` ingress class and stores its account key in `letsencrypt-public-account-key`.

[`helm/routing`](../helm/routing) owns the public Ingresses; the frontend chart creates only its Deployment and Service. The app host sends `/api` to `backend:3001` and `/` to `frontend:3000`. The more specific `/api/agent` prefix goes to a small nginx service that returns 404, keeping internal agent routes off the public origin without nginx configuration snippets. API paths are preserved. Uploads allow a 1 GiB file plus multipart framing and disable ingress request buffering. The media host sends signaling to `livekit:7880` with one-hour proxy timeouts for WebSockets; media itself uses the node's RTC ports.

Both Ingresses reference `letsencrypt-public`; cert-manager requests and renews certificates into `llp-app-tls` and `llp-media-tls`, which ingress-nginx uses for TLS termination. HTTP redirects to HTTPS. Helm release readiness does not establish certificate readiness; issuance also requires working DNS and public port 80.

## Frontend image

[`frontend/Dockerfile.prod`](../frontend/Dockerfile.prod) builds an Arm64 standalone Next.js image. Pass `NEXT_PUBLIC_API_URL=https://<app hostname>` at build time; changing the browser API origin requires rebuilding the image. Workspace tracing includes the repository root so the standalone server includes shared dependencies. [`helm/frontend`](../helm/frontend) sets `AUTH_API_URL=http://backend:3001` at runtime for internal session checks, runs the image as a non-root user, and probes `/login`. Authentication behavior: [`auth.md`](auth.md).

## LiveKit

[`helm/livekit`](../helm/livekit) runs one server with host networking and cluster DNS. It advertises Terraform's Elastic IP plus the internal candidate, uses TCP 7881 and UDP 50000–50020 for media, and exposes signaling internally at `livekit:7880`. Public signaling uses the media Ingress added with routing; no public port 7880 or TURN server is configured.

The existing `llp-livekit` Secret holds `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET`, shared with the backend and teacher agent. An init container renders the config into an in-memory volume; credentials never enter Helm values or ConfigMaps. `helm/livekit/secrets.env` is excluded from Git, agent access, and chart packaging. Config changes roll the pod; Secret changes require a pod restart. Development mode is disabled, and webhooks target the backend's internal speaking endpoint. Room state is in memory; replacing the pod interrupts calls. Redis is unnecessary for this single-server setup.

## API and teacher agent

[`backend/Dockerfile.prod`](../backend/Dockerfile.prod) builds the contracts and API for a shared Arm64 image. It includes FFmpeg, fonts, source files, and TypeScript tools for migrations and the agent. The API runs migrations before listening; the agent overrides the default command. Tini forwards shutdown signals and reaps child processes.

[`helm/backend`](../helm/backend) creates separate single-replica API and teacher-agent Deployments. Both use `Recreate`, so upgrades interrupt their work. `teacherAgent.enabled` allows installing the API first. The API Service is internal at `backend:3001`; public routing is separate. API readiness is TCP; agent readiness uses its SDK's HTTP endpoint on 8081. Neither probe verifies an end-to-end user flow.

Operator-owned inputs are `llp-backend` (keys listed in [`secrets.env.example`](../helm/backend/secrets.env.example)), `llp-database` (`POSTGRES_USER`, `POSTGRES_PASSWORD`), the existing `llp-livekit`, and `llp-rds-ca` (ConfigMap key `ca.pem`, the AWS regional RDS CA bundle). Secret values do not enter Helm. The API mounts the CA for verified database TLS and uses the node role for S3; the agent receives only its OpenAI, internal API, and LiveKit credentials. The Google OAuth client must allow the app origin's `/api/auth/google/callback` URL. Secret or CA changes require restarting consumers; Helm does not detect external input changes.

Media processing uses a disk-backed `emptyDir` workspace and one concurrent explanation clip per video on this dev node. The workspace is temporary and disappears with the pod; durable blobs live in S3. Agent runtime behavior: [`speaking.md`](speaking.md).

## Managed data

[`rds.tf`](../infra/environments/dev/rds.tf) provisions Single-AZ RDS PostgreSQL 17 with encrypted storage, automated backups, TLS enforcement, deletion protection, and a final snapshot on deliberate deletion. Two private subnets satisfy the DB subnet-group requirement; there is no standby or NAT gateway. TCP 5432 is allowed only from the k3s node's security group. RDS logs are exported to CloudWatch with seven-day retention.

RDS manages the administrator password in Secrets Manager; Terraform outputs only its ARN. The initial dev backend will use an operator-synchronized Kubernetes Secret and a mounted RDS CA bundle. Re-import the current password before backend deployments and after managed rotation, then restart consumers. This initial setup does not automatically synchronize Secrets Manager rotation into Kubernetes. A separate restricted runtime DB user remains future hardening. Connection settings: [`backend.md`](backend.md#postgresql).

[`storage.tf`](../infra/environments/dev/storage.tf) provisions a private application S3 bucket, separate from Terraform state. It uses SSE-S3, disabled ACLs, Block Public Access, HTTPS-only access, and versioning. Noncurrent versions expire after 30 days; incomplete multipart uploads are aborted after seven days. Current objects have no automatic expiration. Terraform prevents bucket destruction. The node role has only bucket listing and object read/write/delete/multipart-abort access to this bucket; pods able to reach IMDS share that access.

RDS and S3 survive EC2 replacement and stop/start. Stopping EC2 leaves RDS running; stop it separately if desired. RDS automatically starts again after seven stopped days. Storage, backups, S3 requests/transfers, and Secrets Manager can incur charges independently of EC2. Local Compose continues to run Postgres and MinIO; AWS has no `helm/data` release to install. This setup provisions new storage and does not migrate local or previously deployed data.
