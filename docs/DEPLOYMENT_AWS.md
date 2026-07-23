# Production AWS Deployment Guide

This document outlines the step-by-step procedure for deploying the **Cloud-Based Bus Pass Management System** to Amazon Web Services (AWS) using Infrastructure as Code (Terraform), AWS RDS, S3, EC2 Auto Scaling, and CloudWatch.

---

## AWS Architecture Overview

```
                          [ Internet Traffic ]
                                   │
                         ┌─────────▼─────────┐
                         │ AWS Route 53 DNS  │
                         └─────────┬─────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │ Application Load Balancer   │
                    └──────────────┬──────────────┘
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         │                                                   │
┌────────▼────────┐                                 ┌────────▼────────┐
│ EC2 Instance 1  │ (Auto Scaling Group - AZ 1)     │ EC2 Instance 2  │ (AZ 2)
│ Nginx + Flask   │                                 │ Nginx + Flask   │
└────────┬────────┘                                 └────────┬────────┘
         │                                                   │
         ├─────────────────────────┬─────────────────────────┤
         │                         │                         │
┌────────▼────────┐       ┌────────▼────────┐       ┌────────▼────────┐
│ Amazon RDS DB   │       │ AWS S3 Bucket   │       │ CloudWatch Logs │
│ (PostgreSQL)    │       │ (Doc Storage)   │       │ & Metrics       │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

---

## Deploying Infrastructure via Terraform

### 1. Configure AWS CLI
Ensure AWS CLI is installed and configured with valid credentials:
```bash
aws configure
```

### 2. Deploy Terraform Manifests
```bash
cd deployment/aws/terraform

# Initialize Terraform plugins
terraform init

# Inspect execution plan
terraform plan

# Apply infrastructure creation
terraform apply -auto-approve
```

### 3. Configure S3 & RDS Connection Strings
Export the outputs provided by Terraform into your environment variables:
```bash
export DATABASE_URL="postgresql://buspass_admin:<DB_PASSWORD>@<RDS_ENDPOINT>:5432/buspass_db"
export AWS_S3_BUCKET="cloud-bus-pass-documents-store"
export USE_S3="true"
```

---

## High Availability & Scalability Configurations

1. **Stateless Backend Design**: Flask sessions are encoded using standard JWT tokens, eliminating local server session binding and enabling seamless horizontal scaling across multiple EC2 instances.
2. **Database Connection Pooling**: SQLAlchemy manages connection pools directly with Amazon RDS PostgreSQL.
3. **Automatic CloudWatch Monitoring**: Access Nginx & Flask logs automatically gathered by `deployment/aws/cloudwatch-config.json`.
