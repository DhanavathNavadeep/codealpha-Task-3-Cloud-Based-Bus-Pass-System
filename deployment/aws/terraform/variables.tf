variable "aws_region" {
  default     = "us-east-1"
  description = "AWS deployment region"
}

variable "environment" {
  default     = "production"
  description = "Deployment environment"
}

variable "s3_bucket_name" {
  default     = "cloud-bus-pass-documents-store"
  description = "Unique S3 bucket name"
}

variable "db_username" {
  default     = "buspass_admin"
  description = "RDS master username"
}

variable "db_password" {
  default     = "SecureBusPassPassword2026!"
  description = "RDS master password"
}
