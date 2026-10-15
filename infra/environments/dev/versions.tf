terraform {
  required_version = ">= 1.11.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.33"
    }
  }

  backend "s3" {
    bucket       = "llp-tfstate-318463845732"
    key          = "dev/terraform.tfstate"
    region       = "eu-north-1"
    profile      = "llp-dev"
    encrypt      = true
    use_lockfile = true
  }
}

provider "aws" {
  region  = "eu-north-1"
  profile = "llp-dev"
}
