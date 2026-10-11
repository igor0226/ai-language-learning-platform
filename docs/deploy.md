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

[`infra/environments/dev`](../infra/environments/dev) creates a VPC with one public subnet, an internet gateway, and one `t4g.micro` (Amazon Linux 2023, Graviton) in `eu-north-1`. The security group allows HTTP and HTTPS from the internet and does not open SSH. The instance role can be used by Session Manager. There is no Elastic IP: the public address exists only while the instance is running. State for this stack is `dev/terraform.tfstate` in the same bucket.

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

Start it again with `-var instance_state=running`. Compute and the public IPv4 are billed only while it is running. The 12 GB disk is billed either way.

## k3s

[`k3s-user-data.sh`](../infra/environments/dev/k3s-user-data.sh) runs only on the first boot. It adds 1 GB of swap, installs k3s `v1.36.5+k3s1` with Traefik disabled, and writes the admin kubeconfig to the SSM parameter `/llp/dev/kubeconfig`. Changing that script replaces the instance only when `user_data_replace_on_change` is set and the script contents change. A plain user-data edit stops and starts the existing machine, and cloud-init does not run the script again. If the script is already stored on the instance, `terraform apply -replace=aws_instance.node` creates a new machine so the script runs. Apply while `instance_state` is `running`, so the script is not stopped mid-install. Port 6443 stays closed. The kubeconfig server is `https://127.0.0.1:6443`. kubectl reaches the API through an SSM port forward. Keep that file out of git (`.kubeconfig` is gitignored).

## Ingress

[`helm/ingress-nginx/values.yaml`](../helm/ingress-nginx/values.yaml) installs the ingress-nginx chart as a DaemonSet on the node network, listening on ports 80 and 443. The Service stays `ClusterIP`, so AWS does not create a load balancer. Helm talks to the cluster through the same SSM tunnel as kubectl. With no Ingress rules yet, the public IP returns 404 from nginx.
