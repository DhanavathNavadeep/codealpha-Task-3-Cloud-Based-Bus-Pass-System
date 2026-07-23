#!/bin/bash
# AWS EC2 User Data Script for Auto Provisioning
set -e

echo "Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

echo "Installing Docker & Docker Compose..."
sudo apt-get install -y docker.io docker-compose git

sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

echo "Cloning Cloud-Based Bus Pass System repository..."
mkdir -p /home/ubuntu/app
cd /home/ubuntu/app

# Pull and launch containers via Docker Compose
sudo docker-compose up -d --build

echo "Deployment complete! Application live on port 80."
