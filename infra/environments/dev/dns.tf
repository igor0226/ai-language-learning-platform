resource "aws_eip" "node" {
  domain = "vpc"

  tags = {
    Name = local.name
  }
}

resource "aws_eip_association" "node" {
  allocation_id = aws_eip.node.id
  instance_id   = aws_instance.node.id
}

resource "aws_route53_zone" "dev" {
  name = var.domain_name

  tags = {
    Name = local.name
  }
}

resource "aws_route53_record" "app" {
  zone_id = aws_route53_zone.dev.zone_id
  name    = "${var.environment_label}.app.${var.domain_name}"
  type    = "A"
  ttl     = 300
  records = [aws_eip.node.public_ip]
}

resource "aws_route53_record" "media" {
  zone_id = aws_route53_zone.dev.zone_id
  name    = "${var.environment_label}.media.${var.domain_name}"
  type    = "A"
  ttl     = 300
  records = [aws_eip.node.public_ip]
}
