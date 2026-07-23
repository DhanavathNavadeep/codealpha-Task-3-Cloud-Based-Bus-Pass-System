# Terraform AWS Infrastructure Configuration for Cloud-Based Bus Pass System

provider "aws" {
  region = var.aws_region
}

# 1. VPC and Subnets
resource "aws_vpc" "main_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = {
    Name = "buspass-vpc"
  }
}

# 2. AWS S3 Bucket for Document Storage
resource "aws_s3_bucket" "pass_documents" {
  bucket = var.s3_bucket_name
  tags = {
    Name        = "Bus Pass Identity Documents"
    Environment = var.environment
  }
}

# 3. AWS RDS PostgreSQL Instance
resource "aws_db_instance" "postgres_db" {
  allocated_storage    = 20
  max_allocated_storage = 100
  db_name              = "buspass_db"
  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = "db.t3.micro"
  username             = var.db_username
  password             = var.db_password
  skip_final_snapshot  = true
  publicly_accessible  = false
}

# 4. Security Groups
resource "aws_security_group" "web_sg" {
  name        = "buspass-web-sg"
  description = "Allow HTTP, HTTPS, and SSH traffic"
  vpc_id      = aws_vpc.main_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
