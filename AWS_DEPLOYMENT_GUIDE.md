# Production AWS Deployment Guide for MERN E-Commerce App

This document outlines the complete, step-by-step production deployment workflow for hosting the full-stack MERN E-Commerce application using AWS services, MongoDB Atlas, Nginx, and GitHub Actions.

---

## 1. AWS Architecture Diagram

The diagram below details the production-ready AWS architecture:

```mermaid
graph TD
    User([End User]) -->|HTTPS: 443| CloudFront[AWS CloudFront CDN]
    User -->|HTTPS: 443| Route53[AWS Route 53 DNS]
    Route53 -->|Resolves Domain| CloudFront
    Route53 -->|Resolves API Subdomain| ALB[Nginx Reverse Proxy / EC2]

    subgraph VPC [AWS VPC]
        subgraph PublicSubnet [Public Subnet]
            ALB -->|Port 80/443| Nginx[Nginx Web Server]
            Nginx -->|Proxy Pass: Port 5000| PM2[PM2 Process Cluster]
            subgraph NodeInstances [Node.js API Instances]
                PM2 --> AppInstance1[Express App Instance 1]
                PM2 --> AppInstance2[Express App Instance 2]
            end
        end
    end

    AppInstance1 -.->|Upload / Delete| S3[AWS S3 Bucket: Images]
    AppInstance2 -.->|Upload / Delete| S3
    CloudFront -->|Forwards API requests| Nginx
    CloudFront -->|Caches static frontend assets| S3Frontend[AWS S3: React Build Assets]
    AppInstance1 -->|Database Queries| MongoDB[MongoDB Atlas Cloud Cluster]
    AppInstance2 -->|Database Queries| MongoDB
```

---

## 2. AWS EC2 Instance Setup

### Step A: Launch EC2 Instance
1. Go to the AWS EC2 Dashboard.
2. Click **Launch Instance**.
3. Choose **Ubuntu Server 24.04 LTS (HVM), SSD Volume Type** (64-bit x86).
4. Select instance type (minimum `t3.micro` or `t3.small` for production).
5. Generate and download a key pair (`.pem` file) for SSH access.

### Step B: Configure Security Group
Create a Security Group with the following inbound rules:

| Protocol | Port Range | Source | Reason |
| :--- | :--- | :--- | :--- |
| **SSH (TCP)** | `22` | My IP | Secure command-line access |
| **HTTP (TCP)** | `80` | `0.0.0.0/0` | Let's Encrypt validation & redirection |
| **HTTPS (TCP)** | `443` | `0.0.0.0/0` | Secure public web traffic |
| **Custom TCP** | `5000` | Security Group ID / VPC CIDR | Internal Node.js app access (Optional, Nginx handles publicly) |

### Step C: Connect and Update Server
Use your SSH terminal key to log in:
```bash
# Set correct permissions for your key
chmod 400 your-key.pem

# Connect to instance
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

Once connected, update the package manager:
```bash
sudo apt update && sudo apt upgrade -y
```

### Step D: Install Node.js, Git, and PM2
Install Node.js (LTS version) using NodeSource:
```bash
# Install node packages
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node -v
npm -v

# Install Git
sudo apt install git -y

# Install PM2 globally
sudo npm install -g pm2
```

### Step E: Clone and Configure Backend
1. Clone your project code:
   ```bash
   cd /var/www
   sudo mkdir ecommerce-website
   sudo chown ubuntu:ubuntu ecommerce-website
   git clone <your-repo-url> ecommerce-website
   cd ecommerce-website/Backend
   ```
2. Install dependencies:
   ```bash
   npm install --omit=dev
   ```
3. Configure your production `.env` file:
   ```bash
   nano .env
   ```
   Provide the production variables:
   ```ini
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority
   JWT_USER_SECRET=your_secure_user_jwt_secret
   JWT_ADMIN_SECRET=your_secure_admin_jwt_secret
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://yourdomain.com
   
   # AWS Config
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   AWS_REGION=us-east-1
   AWS_BUCKET_NAME=your-s3-image-bucket-name
   
   # External Integrations
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   ```

### Step F: Start Application using PM2
Start the backend cluster using the preconfigured `ecosystem.config.js`:
```bash
# Start cluster
pm2 start ecosystem.config.js --env production

# Enable PM2 to startup automatically on system reboot
pm2 startup ubuntu
# (Copy-paste the command output by the terminal to set up the startup service)

# Save current PM2 processes to configuration
pm2 save
```

---

## 3. MongoDB Atlas Setup

MongoDB Atlas is the cloud database layer. Follow these setup instructions:

1. **Create an Account / Log In**: Visit [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas) and sign up.
2. **Create a Cluster**:
   - Choose a Free/M10 Shared or Serverless cluster.
   - Select cloud provider **AWS** and your preferred deployment region (e.g. `us-east-1`).
3. **Database Security (Users)**:
   - Go to **Database Access** under Security.
   - Add a new Database User (e.g., `dbAdmin`).
   - Use password authentication (generate a strong password).
   - Assign the privilege role **Read and write to any database**.
4. **Network Access (IP Access List)**:
   - Go to **Network Access** under Security.
   - Click **Add IP Address**.
   - For initial testing, add `0.0.0.0/0` (Allow Access from Anywhere) or preferably, **add the static Elastic IP of your AWS EC2 instance**.
5. **Get Connection String**:
   - Go to **Database** -> click **Connect** on your cluster.
   - Choose **Drivers** (Node.js).
   - Copy the MongoDB connection URI. It will look like this:
     ```ini
     MONGODB_URI=mongodb+srv://dbAdmin:<password>@cluster0.abcde.mongodb.net/ecommerce?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your database user password and `ecommerce` with your database name. Set this in the backend `.env`.

---

## 4. AWS S3 Buckets Setup (Frontend & Images)

We will use two distinct S3 buckets:
1. `ecommerce-images` (For product/banner image storage)
2. `ecommerce-frontend` (For static React build hosting)

### S3 Image Storage Bucket Setup

1. **Create Bucket**:
   - Bucket Name: `ecommerce-images`
   - Region: Match your EC2 region (e.g. `us-east-1`).
   - Leave **Block Public Access** settings enabled (recommended for modern security).
2. **Set Bucket Access Policy (IAM)**:
   - Create an IAM User in AWS IAM Console (e.g. `s3-uploader`).
   - Attach a custom inline policy to allow S3 Put, Delete, and Get operations:
     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Effect": "Allow",
           "Action": [
             "s3:PutObject",
             "s3:GetObject",
             "s3:DeleteObject"
           ],
           "Resource": "arn:aws:s3:::ecommerce-images/*"
         }
       ]
     }
     ```
   - Generate **Access Key ID** and **Secret Access Key** for this IAM User. Put them in the Backend `.env`.

### S3 Frontend Web Hosting Bucket Setup

1. **Create Bucket**:
   - Bucket Name: `ecommerce-frontend-host`
   - Keep **Block Public Access** enabled. CloudFront will access S3 via **Origin Access Control (OAC)** which secures the bucket from public reads directly.

---

## 5. AWS CloudFront CDN Configuration

To cache static files, serve files globally at low latency, and enforce HTTPS for the frontend:

1. Go to the AWS CloudFront console and click **Create Distribution**.
2. **Origin Settings**:
   - Choose the S3 Bucket `ecommerce-frontend-host` as the **Origin Domain**.
   - Under **Origin Access**, choose **Origin Access Control (OAC)**.
   - Create a new OAC control settings profile (default settings work great).
   - Once the distribution is created, copy the S3 Bucket policy provided by CloudFront and paste it into the S3 bucket's **Permissions -> Bucket Policy** tab to authorize CloudFront read access.
3. **Default Cache Behavior**:
   - Viewer Protocol Policy: **Redirect HTTP to HTTPS**.
   - Allowed HTTP Methods: `GET, HEAD, OPTIONS`.
   - Compress Objects Automatically: **Yes**.
4. **Custom Error Responses**:
   To support React Router refresh URLs (routing handled on frontend):
   - Click **Create Error Response**.
   - HTTP Error Code: `403` (and create another for `404`).
   - Customize Error Response: **Yes**.
   - Response Page Path: `/index.html`.
   - HTTP Response Code: `200`.
5. **Alternative Domain Names (CNAMEs)**:
   - Add your custom domain (e.g., `yourdomain.com`).
   - Attach an **ACM SSL Certificate** (Must be created in the `us-east-1` region for CloudFront).

---

## 6. Nginx Reverse Proxy Setup

Nginx sits in front of our Node.js PM2 process to proxy requests and manage SSL.

### Step A: Install Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step B: Create Nginx Configuration
Create a configuration file:
```bash
sudo nano /etc/nginx/sites-available/ecommerce
```

Insert the following server blocks. Replace `yourdomain.com` and `api.yourdomain.com` with your actual domains:

```nginx
# API Subdomain Configuration
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000; # Forward requests to PM2 Node process
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Enforce file upload size limits (corresponds to 5MB backend restriction)
        client_max_body_size 6M;
    }
}

# Frontend HTTP Fallback redirect to CloudFront/HTTPS (If DNS maps directly to Nginx)
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://yourdomain.com$request_uri;
}
```

### Step C: Enable Configuration and Restart Nginx
```bash
# Link to active configuration folder
sudo ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/

# Remove default configuration
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx Syntax
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx
```

---

## 7. Domain Name & SSL Configuration

### Step A: Configure DNS in Route 53 or Domain Provider
1. Create a **Hosted Zone** in Route 53 for your domain `yourdomain.com`.
2. Add DNS Records:
   - **Type A Record**: Name: `yourdomain.com` -> Select **Alias to CloudFront distribution** -> Choose your distribution.
   - **Type A Record**: Name: `api.yourdomain.com` -> Value: `your-ec2-public-ip` (disable alias).

### Step B: Install SSL on EC2 using Let's Encrypt (Certbot)
To secure the `api.yourdomain.com` subdomain on Nginx:
```bash
sudo apt install certbot python3-certbot-nginx -y

# Obtain and install SSL Certificate
sudo certbot --nginx -d api.yourdomain.com

# Verify renewal process is automatic
sudo systemctl status certbot.timer
```
Certbot will modify the Nginx configuration automatically to bind the SSL certificates and configure HTTP -> HTTPS redirections.

---

## 8. Production Security Checklist

*   [ ] **Server Firewalls**: Enforce Security Group limits. Block public port 5000 directly. Only allow public ports 80 and 443.
*   [ ] **Secure Environment Variables**: Ensure `.env` is listed in `.gitignore` so no production credentials slip into GitHub repositories.
*   [ ] **Database Access Restriction**: Ensure the MongoDB cluster IP access list is restricted to the specific public IP of the EC2 backend instance.
*   [ ] **Enable Rate Limiting**: Ensure rate limits are activated on sensitive routes (auth, checkout, cart operations) via `express-rate-limit` (already installed).
*   [ ] **S3 Public Settings**: Block public read/write permissions directly on S3 buckets. Force S3 retrieval via CloudFront OAC.
*   [ ] **Use HTTPS Everywhere**: Force secure connections. Set cookie options to `secure: true, httpOnly: true` in production.
*   [ ] **Disable Directory Listing**: Ensure Nginx directory indexes are disabled (`autoindex off;`).

---

## 9. Deployment Troubleshooting Guide

### Issue A: "502 Bad Gateway" on API
- **Reason**: Nginx is running, but the backend Node.js process is stopped.
- **Solution**:
  1. Check PM2 status: `pm2 status`.
  2. Inspect PM2 logs: `pm2 logs ecommerce-api`.
  3. Verify Node process port is matching Nginx: `netstat -tulpn | grep 5000`.

### Issue B: React Router paths return "404 Not Found" or "403 Forbidden" on refresh
- **Reason**: CloudFront is searching for a physical directory on S3 that matches the URL, rather than serving `index.html` which handles client-side routing.
- **Solution**: Go to CloudFront Distribution -> **Error Responses** -> Add custom error responses for HTTP 403 and 404, pointing to `/index.html` with status code 200.

### Issue C: CORS error on frontend calls
- **Reason**: The API is rejecting requests because the frontend domain is mismatching config origin settings.
- **Solution**: Verify the value of `FRONTEND_URL` in the backend `.env` matches the exact URL of your frontend domain (including `https://` without a trailing slash).
