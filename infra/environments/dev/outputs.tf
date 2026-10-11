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
