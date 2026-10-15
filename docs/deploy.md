# AWS deploy

Practice deploy for this repo. Local Compose stays in [`local-dev.md`](local-dev.md). Remote state lives in [`infra/bootstrap`](../infra/bootstrap). The practice network and instance live in [`infra/environments/dev`](../infra/environments/dev). The instance boot script installs k3s.

The account uses Sign up for AWS (new): one project, Google sign-in, MFA on that user, advanced features left off. CLI and Terraform use the `llp-dev` profile. Regional resources go in `eu-north-1` (Stockholm), the region AWS assigned to the project. `us-east-1` stays available for global services such as IAM and Route 53, and a service control policy denies creating buckets and instances there. Sign in again when the session expires (about 12 hours):

```bash
aws login --profile llp-dev
```

## Remote state

[`infra/bootstrap`](../infra/bootstrap) creates a private S3 bucket, `llp-tfstate-<account-id>`, with versioning, SSE-S3, and public access blocked. Terraform 1.11 and later lock state with an S3 lock file (`use_lockfile`). DynamoDB locking is deprecated, so this stack does not create a lock table.

The bucket cannot store its own first apply, so the first `terraform apply` uses a state file on the laptop. After that bucket exists, `versions.tf` points the backend at `s3://llp-tfstate-<account-id>/bootstrap/terraform.tfstate`. Re-initialize to copy the local state into the bucket:

```bash
cd infra/bootstrap
terraform init -migrate-state
```

Answer `yes` when Terraform asks to copy the existing state. Later applies in this directory read and write that object, and `use_lockfile` stops a second apply from running at the same time.

State files and `.terraform/` are gitignored. Commit `.terraform.lock.hcl`. Do not destroy this bucket while other stacks store state in it; the bucket has `prevent_destroy` set.

## Dev network and instance

[`infra/environments/dev`](../infra/environments/dev) creates a VPC with one public subnet, an internet gateway, and one Graviton instance (Amazon Linux 2023) in `eu-north-1`. The size and disk are in [Capacity](#capacity). The security group allows HTTP, HTTPS, and LiveKit media ports, and does not open SSH. The instance role can be used by Session Manager and can pull the `frontend` and `backend` ECR repositories. The public address is an Elastic IP; see [Public name](#public-name). State for this stack is `dev/terraform.tfstate` in the same bucket.

```bash
cd infra/environments/dev
terraform init
terraform plan
terraform apply
```

`terraform init` configures the S3 backend. `terraform plan` only prints the change. `terraform apply` creates the network and starts the instance. Stop it between sessions without deleting the disk:

```bash
terraform apply -var instance_state=stopped
```

Start it again with `-var instance_state=running`. Compute is billed only while the instance is running. The Elastic IP stays allocated when the instance is stopped (about half a cent an hour). The root disk is billed either way. `domain_name` still has to be set; Terraform reads it from `dev.auto.tfvars`.

## Public name

[`dns.tf`](../infra/environments/dev/dns.tf) keeps a name that does not change when you stop the instance. Terraform creates three things:

- An Elastic IP, attached to the practice instance. Browsers should use this address. The old auto-assigned public IP disappears on stop; this one does not.
- A Route 53 public hosted zone for `domain_name`. That value is the registered domain. Hostinger's nameservers point at this zone, and Hostinger does not delegate a child zone.
- A records `<environment_label>.app.<domain>` and `<environment_label>.media.<domain>` pointing at that Elastic IP. `environment_label` defaults to `dev`, so the practice names are `dev.app.example.com` and `dev.media.example.com`.

`domain_name` has no default. Put it in `infra/environments/dev/dev.auto.tfvars` (gitignored). Copy the example and replace the placeholder:

```bash
cd infra/environments/dev
cp dev.auto.tfvars.example dev.auto.tfvars
```

`dev.auto.tfvars`:

```hcl
domain_name = "example.com"
```

Register the domain yourself, at any registrar or in the Route 53 console (`us-east-1`). Terraform does not buy the name. If the console already created a hosted zone for that domain, delete the empty zone before apply, or import it, so Terraform does not create a second zone.

Then review and apply. `plan` only prints the change. `apply` allocates the address and writes the DNS records.

```bash
cd infra/environments/dev
terraform init
terraform plan
terraform apply
```

`terraform init` is only needed the first time in this directory, or after the backend config changes. Later applies can start at `plan`.

After apply, print the name servers and point the registrar at them (skip this if the domain already uses this hosted zone):

```bash
terraform output route53_name_servers
terraform output public_ip
```

Check that the name matches the Elastic IP. TLS later will fail until this is true.

```bash
dig +short dev.app.example.com
```

Changing `environment_label` only renames those two records. The hosted zone and the registrar name servers stay as they are. `domain_name` stays the registered apex (`lang-platform.online` for this account).

The hosted zone is about $0.50 a month. Stopping the instance keeps the IP and the DNS name; the site stops answering until you start the instance again.

## Capacity

`t4g.micro` (1 GiB) cannot run k3s together with Postgres, MinIO, Nest, the teacher agent, and LiveKit. [`instance.tf`](../infra/environments/dev/instance.tf) uses `instance_type`, which defaults to `t4g.medium` (4 GiB). The root volume grows from 12 GB to 30 GB. Both changes keep the existing disk. Terraform stops and starts the instance to change its type. [`k3s-user-data.sh`](../infra/environments/dev/k3s-user-data.sh) is unchanged, so this apply does not replace the machine.

The same apply also opens LiveKit media ports on the security group: TCP 7881 and UDP 50000–50020, matching [`livekit.yaml`](../livekit.yaml). Browser signaling stays on HTTPS 443. Postgres and MinIO are not exposed. It creates the ECR repository `backend` next to `frontend`, lets the instance role pull only those two repositories, and sets the instance metadata hop limit to 2 so a later in-cluster job can use that role. `ecr:GetAuthorizationToken` stays on `*`, because ECR login tokens are issued for the account, not for one repository.

```bash
cd infra/environments/dev
terraform plan
terraform apply
```

`plan` should show the instance type, the volume size, two security-group rules, the backend repository, and the role attachment. It should not show a new instance. The Elastic IP and the `dev.app` / `dev.media` records stay.

After the instance is running again, open a shell with Session Manager and check the filesystem. AWS grows the disk volume; the filesystem grows only if the OS does it on boot.

```bash
aws ssm start-session --profile llp-dev --region eu-north-1 \
  --target "$(terraform output -raw instance_id)"
```

On the instance:

```bash
df -h /
lsblk
```

If `/` is still about 12 GB, grow it. On Amazon Linux 2023 the root disk is usually `nvme0n1`:

```bash
sudo growpart /dev/nvme0n1 1
sudo xfs_growfs /
df -h /
```

Use the disk name from `lsblk` if it is different. Exit the session when `df` shows about 30 GB.

## k3s

[`k3s-user-data.sh`](../infra/environments/dev/k3s-user-data.sh) runs only on the first boot. It adds 1 GB of swap, installs k3s `v1.36.5+k3s1` with Traefik disabled, and writes the admin kubeconfig to the SSM parameter `/llp/dev/kubeconfig`. Changing that script replaces the instance only when `user_data_replace_on_change` is set and the script contents change. A plain user-data edit stops and starts the existing machine, and cloud-init does not run the script again. If the script is already stored on the instance, `terraform apply -replace=aws_instance.node` creates a new machine so the script runs. Apply while `instance_state` is `running`, so the script is not stopped mid-install. Port 6443 stays closed. The kubeconfig server is `https://127.0.0.1:6443`. kubectl reaches the API through an SSM port forward. Keep that file out of git (`.kubeconfig` is gitignored).

## Ingress

[`helm/ingress-nginx/values.yaml`](../helm/ingress-nginx/values.yaml) installs the ingress-nginx chart as a DaemonSet on the node network, listening on ports 80 and 443. The Service stays `ClusterIP`, so AWS does not create a load balancer. Helm talks to the cluster through the same SSM tunnel as kubectl. With no Ingress rules yet, the public IP returns 404 from nginx.

## Frontend image

[`frontend/Dockerfile.prod`](../frontend/Dockerfile.prod) builds a Next.js standalone server. Compose keeps using [`frontend/Dockerfile`](../frontend/Dockerfile). `NEXT_PUBLIC_API_URL` is baked in at build time; the practice image points it at a hostname that does not exist yet, so `/login` can render and data calls fail. [`infra/environments/dev/ecr.tf`](../infra/environments/dev/ecr.tf) creates the ECR repository. [`helm/frontend`](../helm/frontend) runs that image behind the ingress. The cluster pulls it with a docker-registry secret named `ecr`. That secret expires after 12 hours. Creating the repository does not replace the EC2 instance.
