output "state_bucket_name" {
  description = "S3 bucket that stores Terraform state."
  value       = aws_s3_bucket.state.id
}

output "state_bucket_region" {
  description = "Region of the Terraform state bucket."
  value       = aws_s3_bucket.state.region
}
