output "rds_endpoint" {
  value       = aws_db_instance.postgres_db.endpoint
  description = "PostgreSQL RDS connection endpoint"
}

output "s3_bucket_arn" {
  value       = aws_s3_bucket.pass_documents.arn
  description = "ARN of identity document storage bucket"
}
