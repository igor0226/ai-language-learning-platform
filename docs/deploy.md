# AWS dev deployment

This document describes the durable AWS and Kubernetes design for the development environment. Keep session-specific commands, deployment checkpoints, and troubleshooting in the deployment chat or CI workflow.

## Ownership

| Tool | Owns |
| --- | --- |
| Terraform | AWS network, EC2, EBS, Elastic IP, Route 53, ECR, IAM, and instance power state |
| Helm | Kubernetes releases and their configuration |
| k3s | Kubernetes control plane and kubelet on the EC2 instance |

Terraform state is stored in the private, versioned S3 bucket created by [`infra/bootstrap`](../infra/bootstrap). The dev stack state key is `dev/terraform.tfstate`.

## AWS environment

The `llp-dev` AWS profile deploys regional resources in `eu-north-1`. [`infra/environments/dev`](../infra/environments/dev) creates one public-subnet VPC and one Amazon Linux 2023 Arm64 instance.

The instance has a 30 GB encrypted gp3 root volume, an SSM instance role, and no SSH ingress. It can be stopped with Terraform without removing the EBS volume, Elastic IP, DNS records, or ECR repositories. A change to [`k3s-user-data.sh`](../infra/environments/dev/k3s-user-data.sh) replaces the instance because `user_data_replace_on_change` is enabled.

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

A workload becomes public when its Helm chart creates a host-specific Ingress that references `letsencrypt-public` and a TLS secret. cert-manager then requests and renews the certificate.
