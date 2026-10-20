output "instance_id" {
  description = "EC2 instance id. Use this with Session Manager."
  value       = aws_instance.node.id
}

output "public_ip" {
  description = "Elastic IP for app and media DNS. Stays allocated while the instance is stopped."
  value       = aws_eip.node.public_ip
}

output "domain_name" {
  description = "Zone apex from dev.auto.tfvars."
  value       = var.domain_name
}

output "app_fqdn" {
  description = "Public app hostname."
  value       = aws_route53_record.app.fqdn
}

output "media_fqdn" {
  description = "Public LiveKit signaling hostname."
  value       = aws_route53_record.media.fqdn
}

output "route53_name_servers" {
  description = "Delegate the domain at the registrar to these name servers."
  value       = aws_route53_zone.dev.name_servers
}

output "frontend_repository_url" {
  description = "ECR repository for the frontend image."
  value       = aws_ecr_repository.frontend.repository_url
}

output "backend_repository_url" {
  description = "ECR repository for the backend and teacher-agent image."
  value       = aws_ecr_repository.backend.repository_url
}

output "db_instance_identifier" {
  description = "RDS identifier for status checks and separate stop/start operations."
  value       = aws_db_instance.app.identifier
}

output "db_host" {
  description = "Private RDS DNS address, without the port."
  value       = aws_db_instance.app.address
}

output "db_port" {
  value = aws_db_instance.app.port
}

output "db_name" {
  value = aws_db_instance.app.db_name
}

output "db_master_secret_arn" {
  description = "ARN only; the password is managed by RDS in Secrets Manager."
  value       = aws_db_instance.app.master_user_secret[0].secret_arn
}

output "media_bucket_name" {
  value = aws_s3_bucket.media.id
}

output "media_bucket_region" {
  value = aws_s3_bucket.media.region
}
