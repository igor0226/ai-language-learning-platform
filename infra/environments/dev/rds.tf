# RDS needs a subnet group spanning two AZs, even for a Single-AZ database.
resource "aws_subnet" "database" {
  count = 2

  vpc_id                  = aws_vpc.dev.id
  cidr_block              = cidrsubnet(aws_vpc.dev.cidr_block, 8, count.index + 2)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = false

  tags = {
    Name = "${local.name}-database-${count.index + 1}"
  }
}

# Only the implicit VPC-local route; these subnets need no NAT gateway.
resource "aws_route_table" "database" {
  vpc_id = aws_vpc.dev.id

  tags = {
    Name = "${local.name}-database"
  }
}

resource "aws_route_table_association" "database" {
  count = 2

  subnet_id      = aws_subnet.database[count.index].id
  route_table_id = aws_route_table.database.id
}

resource "aws_db_subnet_group" "app" {
  name       = "${local.name}-database"
  subnet_ids = aws_subnet.database[*].id
}

resource "aws_security_group" "database" {
  name        = "${local.name}-database"
  description = "PostgreSQL only from the k3s node"
  vpc_id      = aws_vpc.dev.id

  ingress {
    description     = "Application and migrations from k3s"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.node.id]
  }
}

resource "aws_db_parameter_group" "app" {
  name   = "${local.name}-postgres17"
  family = "postgres17"

  parameter {
    name  = "rds.force_ssl"
    value = "1"
  }
}

data "aws_rds_engine_version" "postgres" {
  engine  = "postgres"
  version = "17"
  latest  = true
}

resource "aws_cloudwatch_log_group" "database" {
  for_each = toset(["postgresql", "upgrade"])

  name              = "/aws/rds/instance/${local.name}-postgres/${each.key}"
  retention_in_days = 7
}

resource "aws_db_instance" "app" {
  identifier     = "${local.name}-postgres"
  engine         = "postgres"
  engine_version = data.aws_rds_engine_version.postgres.version
  instance_class = var.db_instance_class

  allocated_storage     = 20
  max_allocated_storage = 50
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name                     = "video_streaming"
  username                    = "llp_admin"
  manage_master_user_password = true

  publicly_accessible    = false
  multi_az               = false
  db_subnet_group_name   = aws_db_subnet_group.app.name
  vpc_security_group_ids = [aws_security_group.database.id]
  parameter_group_name   = aws_db_parameter_group.app.name

  backup_retention_period         = 7
  auto_minor_version_upgrade      = true
  allow_major_version_upgrade     = false
  copy_tags_to_snapshot           = true
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  deletion_protection       = true
  skip_final_snapshot       = false
  final_snapshot_identifier = "${local.name}-postgres-final"

  tags = {
    Name = "${local.name}-postgres"
  }

  depends_on = [aws_cloudwatch_log_group.database]
}
