output "instance_id" {
  description = "EC2 instance id. Use this with Session Manager."
  value       = aws_instance.node.id
}

output "public_ip" {
  description = "Public IPv4 while the instance is running. Empty after a stop."
  value       = aws_instance.node.public_ip
}

output "frontend_repository_url" {
  description = "ECR repository for the frontend image."
  value       = aws_ecr_repository.frontend.repository_url
}
