# Preserve state continuity if the earlier policy was already applied.
moved {
  from = aws_iam_role_policy.database_secret_sync
  to   = aws_iam_role_policy.database_migrations
}

# Migration jobs read the current master secret.
# k3s pods use the node role through IMDS, as with the existing S3 access.
resource "aws_iam_role_policy" "database_migrations" {
  name = "database-migrations"
  role = aws_iam_role.node.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["secretsmanager:GetSecretValue"]
      Resource = aws_db_instance.app.master_user_secret[0].secret_arn
    }]
  })
}
