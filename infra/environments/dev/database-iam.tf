resource "aws_iam_role_policy" "database_connect" {
  name = "database-connect"
  role = aws_iam_role.node.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["rds-db:connect"]
      Resource = "arn:aws:rds-db:eu-north-1:${data.aws_caller_identity.current.account_id}:dbuser:${aws_db_instance.app.resource_id}/llp_app"
    }]
  })
}
