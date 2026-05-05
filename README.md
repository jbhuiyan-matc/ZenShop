# ZenShop E-Commerce: Build & Security Documentation

**Installation Instructions | Configuration Documentation | Hardening Guidelines**

| **Project**        | E-Commerce Website                          |
|--------------------|---------------------------------------------|
| **Student**        | Jobayer Bhuiyan                             |
| **Environment**    | Proxmox / NetLab DMZ web server             |
| **Primary Domain** | `matcsecdesignc.com` / `www.matcsecdesignc.com` |
| **Web Server IP**  | `192.168.2.51`                              |

<img src="docs/media/image1.png" style="width:7.1in;height:3.97222in" alt="ZenShop Homepage" />

## 1. Project Overview

This document serves as the comprehensive build and security reference for the ZenShop e-commerce platform, deployed within the Security Design NetLab environment. The objective was to deploy a fully functional e-commerce application into a DMZ, securely connect a React frontend to a Node.js backend and PostgreSQL database, publish the service via Nginx with HTTPS, and implement strict security controls to protect the infrastructure.

### 1.1 Completed Architecture & Services

- **DMZ Web Server:** Ubuntu-based server configured with static addressing on the `br_dmz` network.
- **Application Deployment:** ZenShop source code cloned from GitHub and hosted locally.
- **Containerization (Docker Compose):** Isolated services for the Node.js backend, PostgreSQL database, and Redis cache.
- **Database Management:** Prisma ORM utilized for successful schema migration and data seeding; product inventory is dynamically rendered on the website.
- **Reverse Proxy:** Nginx configured to serve static frontend assets and securely proxy API traffic to the internal backend.
- **Encryption:** HTTPS enforced using a locally generated TLS certificate, with automatic HTTP-to-HTTPS redirection.
- **Networking & Access:** DNS and firewall policies strictly configured so `matcsecdesignc.com` routes exclusively to the ZenShop web service.

### 1.2 Server Resources

| **Component**      | **Allocation**             |
|--------------------|----------------------------|
| **Memory**         | 8 GB                       |
| **Processor**      | 4 vCPU (1 socket, 4 cores) |
| **Machine Type**   | i440fx                     |
| **Hard Disk**      | 233 GB                     |
| **Network Bridge** | `br_dmz`                   |

<img src="docs/media/image2.png" style="width:4.5in;height:3.61197in" alt="Network Configuration" />

*Figure 1. Static IPv4 configuration for the DMZ web server: IP `192.168.2.51/24`, Gateway `192.168.2.1`, and DNS `8.8.8.8` / `8.8.4.4`.*

---

## 2. Detailed Step-by-Step Installation Instructions

This section outlines the baseline installation, starting from a fresh DMZ web server to a containerized, functioning application stack.

### 2.1 Configure the Web Server Network

To ensure the server is reliably reachable within the DMZ and can be mapped to DNS, a static IP is required.

1. Open the wired IPv4 settings on the Ubuntu DMZ web server.
2. Set the IPv4 method to **Manual**.
3. Assign the IP address `192.168.2.51` with the subnet mask `255.255.255.0`.
4. Set the gateway to `192.168.2.1`.
5. Set DNS to `8.8.8.8` and `8.8.4.4` to allow for initial package installation and system updates.
6. Apply the network settings and verify external connectivity:

```bash
ping 8.8.8.8
```

### 2.2 Install Required System Packages

Update the Ubuntu package indexes and install the foundational tools required for the build.

```bash
sudo apt update  
sudo apt install npm git -y  
```

<img src="docs/media/image3.png" style="width:5.8in;height:2.39061in" alt="Installing npm" />

*Figure 2. Updating system packages and installing the Node Package Manager (npm).*

<img src="docs/media/image4.png" style="width:5.8in;height:1.85008in" alt="Installing Git" />

*Figure 3. Git successfully installed on the web server.*

### 2.3 Clone the ZenShop Repository

Retrieve the application source code from the repository.

```bash
git clone https://github.com/jbhuiyan-matc/ZenShop.git  
cd ZenShop
```

<img src="docs/media/image5.png" style="width:5.8in;height:1.28109in" alt="Cloning ZenShop" />

*Figure 4. ZenShop repository cloned to the local DMZ server.*

### 2.4 Prepare the Frontend Environment

The frontend is a React application built with Vite. We first install its dependencies to verify it runs, though product data requires the backend to function.

```bash
cd ZenShop/frontend  
npm install  
npm run dev
```

<img src="docs/media/image6.png" style="width:5in;height:0.41958in" alt="Frontend Directory" />

*Figure 5. Navigating into the frontend directory.*

<img src="docs/media/image7.png" style="width:5.6in;height:1.95588in" alt="Vite Server" />

*Figure 6. Running the Vite frontend development server on `localhost:3000`.*

<img src="docs/media/image8.png" style="width:5.8in;height:3.4538in" alt="Frontend Missing Data" />

*Figure 7. The frontend page loads successfully, but no products appear because the backend API is not yet running. This proves the UI is functional but awaiting data.*

### 2.5 Create the Backend Environment Configuration

Environment variables securely inject database credentials and cryptographic secrets without hardcoding them into the source code.

```bash
cd ../backend  
cp .env.example .env  
nano .env
```

Ensure the file contains the necessary database connection string and strongly generated secrets for JWT (JSON Web Tokens) and session management:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/zenshop  
NODE_ENV=production
JWT_SECRET=your_secure_jwt_secret_key_here
SESSION_SECRET=your_secure_session_secret_key_here
```

<img src="docs/media/image9.png" style="width:5.6in;height:1.17945in" alt="Copying env file" />

*Figure 8. Copying `.env.example` to `.env` and opening the environment configuration file.*

<img src="docs/media/image10.png" style="width:5.8in;height:2.05499in" alt="Backend env file" />

*Figure 9. The configured backend `.env` file showing the database connection string and environment variables.*

### 2.6 Install Docker and Docker Compose

Docker is utilized to isolate the backend, database, and caching services, ensuring consistent environments and easier management.

```bash
sudo apt install -y docker.io docker-compose-v2  
sudo systemctl start docker  
sudo systemctl enable docker
```

<img src="docs/media/image11.png" style="width:5.8in;height:2.07279in" alt="Installing Docker" />

*Figure 10. Installing the Docker Engine.*

<img src="docs/media/image12.png" style="width:5.8in;height:2.33881in" alt="Installing Docker Compose" />

*Figure 11. Installing Docker Compose v2.*

<img src="docs/media/image13.png" style="width:5.4in;height:1.03333in" alt="Enabling Docker" />

*Figure 12. Starting and enabling the Docker service to ensure containers launch automatically upon server reboot.*

### 2.7 Start the Application Stack

We use Docker Compose to build and spin up the complete backend infrastructure. This provisions persistent volumes for PostgreSQL (user/product data) and Redis (session/caching data).

```bash
cd ~/ZenShop  
docker compose version  
sudo docker compose up -d --build
```

<img src="docs/media/image14.png" style="width:5.8in;height:3.6196in" alt="Building Containers" />

*Figure 13. Docker Compose building the backend application image and pulling required database containers.*

<img src="docs/media/image15.png" style="width:5.8in;height:0.86044in" alt="Containers Started" />

*Figure 14. Backend, PostgreSQL, and Redis containers successfully created and started in detached mode.*

### 2.8 Generate Prisma Client, Apply Migrations, and Seed Data

With the database running, we must apply our schema and seed initial inventory data.

```bash
sudo docker compose exec zenshop-backend npx prisma generate  
sudo docker compose exec zenshop-backend npx prisma migrate deploy  
sudo docker compose exec zenshop-backend npm run seed
```

<img src="docs/media/image16.png" style="width:5.8in;height:2.29988in" alt="Prisma Generate" />

*Figure 15. The Prisma client successfully generated inside the backend container.*

<img src="docs/media/image17.png" style="width:5.8in;height:1.28804in" alt="Prisma Migrate" />

*Figure 16. Prisma migrations successfully deployed against the internal `zenshop-postgres:5432` database.*

<img src="docs/media/image18.png" style="width:5.8in;height:1.51629in" alt="Database Seed" />

*Figure 17. Database seed completed; initial product categories, 16 sample products, and the default administrator account were successfully created.*

### 2.9 Build and Publish the Frontend

Prepare the frontend for production by compiling the assets and moving them to the Nginx web root.

```bash
cd ~/ZenShop/frontend  
npm run build  
sudo mkdir -p /var/www/zenshop  
sudo cp -r dist/* /var/www/zenshop/
```

<img src="docs/media/image19.png" style="width:4.8in;height:2.67342in" alt="Frontend Build" />

*Figure 18. The Vite frontend production build completed successfully.*

<img src="docs/media/image20.png" style="width:5.8in;height:0.91339in" alt="Copying Build Files" />

*Figure 19. Creating the `/var/www/zenshop` directory and copying the compiled static files into the Nginx web root.*

---

## 3. Detailed Step-by-Step Configuration Documentation

### 3.1 Verify Application Functionality Before Nginx

Before introducing Nginx into the architecture, we verify that the frontend and backend communicate successfully.

```bash
cd ~/ZenShop/frontend  
npm run dev
```

<img src="docs/media/image21.png" style="width:5.6in;height:2.34803in" alt="Running Dev Server" />

*Figure 20. Running the frontend development server temporarily to test API connectivity.*

<img src="docs/media/image22.png" style="width:5.8in;height:3.62595in" alt="Products Visible" />

*Figure 21. Product categories and inventory items are now fully visible. This proves the frontend is successfully retrieving data from the backend database via the API.*

<img src="docs/media/image23.png" style="width:5.8in;height:1.10193in" alt="Docker PS" />

*Figure 22. Running `docker ps` proves the Backend, PostgreSQL, and Redis containers are running stably on their respective internal ports.*

### 3.2 Install and Enable Nginx

Nginx acts as our primary entry point, serving the frontend files and reverse proxying API traffic.

```bash
sudo apt install -y nginx  
sudo mkdir -p /etc/nginx/sites-available/ /etc/nginx/sites-enabled/
```

<img src="docs/media/image24.png" style="width:5.8in;height:1.36563in" alt="Installing Nginx" />

*Figure 23. Nginx successfully installed on the web server.*

<img src="docs/media/image25.png" style="width:5.6in;height:0.84878in" alt="Nginx Directories" />

*Figure 24. Ensuring the Nginx site configuration directories exist.*

### 3.3 Configure the ZenShop Nginx Site

We copy our pre-configured Nginx file, enable it via a symbolic link, and remove the default Nginx site to prevent port conflicts.

```bash
sudo cp nginx/zenshop.conf /etc/nginx/sites-available/zenshop  
sudo ln -s /etc/nginx/sites-available/zenshop /etc/nginx/sites-enabled/  
sudo rm -f /etc/nginx/sites-enabled/default
```

<img src="docs/media/image26.png" style="width:5.8in;height:0.35096in" alt="Copy Nginx Config" />

*Figure 25. Copying the ZenShop Nginx configuration into `sites-available`.*

<img src="docs/media/image27.png" style="width:5.8in;height:0.36632in" alt="Symlink Nginx Config" />

*Figure 26. Enabling the site by creating a symbolic link in `sites-enabled`.*

<img src="docs/media/image28.png" style="width:5.8in;height:0.51108in" alt="Remove Default Site" />

*Figure 27. Deleting the default Nginx configuration to ensure our site handles all traffic.*

### 3.4 Create SSL Certificate Directories and Certificate

To enforce HTTPS, we generate a local TLS certificate for our domain.

```bash
sudo mkdir -p /etc/ssl/certs /etc/ssl/private

sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/zenshop.key \
  -out /etc/ssl/certs/zenshop-fullchain.crt \
  -subj "/C=US/ST=WI/L=Madison/O=MATC/CN=matcsecdesignc.com"
```

<img src="docs/media/image29.png" style="width:5.2in;height:0.54789in" alt="SSL Directories" />

*Figure 28. Creating secure directories to hold the cryptographic keys.*

<img src="docs/media/image30.png" style="width:5.8in;height:1.52145in" alt="Generating Certificate" />

*Figure 29. A self-signed X.509 certificate successfully generated for `matcsecdesignc.com`.*

### 3.5 Test and Reload Nginx

```bash
sudo nginx -t  
sudo systemctl reload nginx
```

<img src="docs/media/image31.png" style="width:4.8in;height:0.85556in" alt="Nginx Test" />

*Figure 30. Nginx configuration syntax test passed, confirming our deployment is ready to accept traffic.*

### 3.6 Nginx Reverse Proxy Configuration Breakdown

This configuration establishes three core security controls:
1. **HTTP to HTTPS Redirection:** Forces all traffic to be encrypted.
2. **Topology Hiding:** Clients interact with Nginx on port `443`, while API requests are securely forwarded to the Node.js backend on `127.0.0.1:3001`. The backend is never exposed directly.
3. **Modern Cryptography:** Enforces TLSv1.2 and TLSv1.3 while dropping insecure legacy protocols.

```nginx
# ZenShop Nginx Configuration  
server {  
    listen 80;  
    server_name matcsecdesignc.com www.matcsecdesignc.com;  
    return 301 https://$host$request_uri;  
}  

server {  
    listen 443 ssl http2;  
    server_name matcsecdesignc.com www.matcsecdesignc.com;  

    ssl_certificate /etc/ssl/certs/zenshop-fullchain.crt;  
    ssl_certificate_key /etc/ssl/private/zenshop.key;  
    ssl_protocols TLSv1.2 TLSv1.3;  
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;  
    ssl_session_cache shared:SSL:10m;  
    ssl_session_timeout 1d;  

    root /var/www/zenshop;  
    index index.html;  

    gzip on;  
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;  
    gzip_min_length 1000;  

    # Reverse Proxy for API Traffic
    location /api {  
        proxy_pass http://127.0.0.1:3001;  
        proxy_http_version 1.1;  
        proxy_set_header Upgrade $http_upgrade;  
        proxy_set_header Connection 'upgrade';  
        proxy_set_header Host $host;  
        proxy_set_header X-Real-IP $remote_addr;  
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;  
        proxy_set_header X-Forwarded-Proto $scheme;  
        proxy_cache_bypass $http_upgrade;  
        proxy_connect_timeout 10s;  
        proxy_send_timeout 60s;  
        proxy_read_timeout 60s;  
    }  

    location /health {  
        proxy_pass http://127.0.0.1:3001;  
        proxy_http_version 1.1;  
        proxy_set_header Host $host;  
        proxy_set_header X-Real-IP $remote_addr;  
    }  

    location / {  
        try_files $uri $uri/ /index.html;  
    }  

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {  
        expires 1y;  
        add_header Cache-Control "public, immutable";  
    }  
}
```

<img src="docs/media/image32.png" style="width:5.8in;height:0.23347in" alt="Nginx File" />

*Figure 31. Displaying the contents of the deployed `zenshop.conf` file.*

### 3.7 Configure Local Hostname Resolution

For isolated lab testing, the local `hosts` file is updated to route domain queries directly to the DMZ web server.

```bash
sudo nano /etc/hosts
```

Add the following mappings:

```text
192.168.2.51 matcsecdesignc.com www.matcsecdesignc.com  
192.168.2.51 store.matcsecdesignc.com
```

<img src="docs/media/image33.png" style="width:5.2in;height:3.7283in" alt="Hosts File" />

*Figure 32. `/etc/hosts` entries proving localized domain resolution for the test environment.*

### 3.8 Configure Firewall NAT and Security Policy

The perimeter firewall requires rules to permit and translate traffic bound for the application.

- **NAT Policy:** Translates external requests seamlessly to the internal DMZ web server IP (`192.168.2.51`).
- **Security Policy:** Explicitly permits web traffic (HTTP/HTTPS) to reach the service, blocking all unapproved ports.
- **Note for Presentation:** The backend API and databases are *never* exposed directly through the firewall; they remain safely behind Nginx inside the DMZ.

<img src="docs/media/image34.png" style="width:5.8in;height:3.63663in" alt="NAT Policy" />

*Figure 33. The Firewall NAT policy actively translating traffic toward the internal web server.*

<img src="docs/media/image35.png" style="width:5.8in;height:3.61826in" alt="Security Policy" />

*Figure 34. The Firewall Security policy actively enforcing access controls and allowing only approved web application traffic.*

### 3.9 Configure DNS Records

Configuring DNS servers `dns-1` and `dns-2` guarantees that standard web requests resolve correctly to our server without requiring local host file overrides for external users.

```text
matcsecdesignc.com.       A   192.168.2.51  
www.matcsecdesignc.com.   A   192.168.2.51  
store.matcsecdesignc.com. A   192.168.2.51
```

<img src="docs/media/image36.png" style="width:5.8in;height:3.40791in" alt="DNS Zone File" />

*Figure 35. The DNS zone file proving that A-records successfully bind the domains to `192.168.2.51`.*

<img src="docs/media/image37.png" style="width:5.8in;height:3.60193in" alt="Final Browser Verification" />

*Figure 36. Final Validation: Navigating to `matcsecdesignc.com` over HTTPS successfully loads the complete, interactive ZenShop storefront.*

### 3.10 Validation Checklist

To confirm mission success, all core components were verified using the steps below:

| **Validation Item**  | **Command / Action**                 | **Expected Result**                                    |
|----------------------|--------------------------------------|--------------------------------------------------------|
| Network Connectivity | `ping 8.8.8.8`                       | Server has reliable external network connectivity.     |
| Docker Service       | `sudo systemctl status docker`       | Docker daemon is active and enabled for persistence.   |
| Container Health     | `sudo docker ps`                     | Backend, PostgreSQL, and Redis containers are running. |
| Database Status      | `npx prisma migrate deploy`          | Schema successfully deployed with no pending tasks.    |
| Data Integrity       | `npm run seed`                       | 16 products and categories exist in the database.      |
| Nginx Routing        | `sudo nginx -t`                      | Nginx configuration test passes with zero errors.      |
| Application Access   | Browse to `https://matcsecdesignc.com`| ZenShop loads securely, rendering product data.        |
| Admin Authentication | Login with `admin@zenshop.com`       | Credentials authenticate and grant admin privileges.   |

---

## 4. Detailed Hardening Guidelines Documentation

A "security-first" posture requires continuous application of defense-in-depth principles. The following hardening controls have been evaluated, applied, and documented for the ZenShop environment to defend against common attack vectors.

### 4.1 Infrastructure & Networking Defenses

| **Control Area**         | **Hardening Action Implemented** |
|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| **Operating System**     | Maintain Ubuntu patch levels via `apt update`. Purge unused packages. Enforce non-root administrator accounts and restrict `sudo` privileges.     |
| **Firewall Exposure**    | Employ strict firewall rules. Expose **only** HTTP/HTTPS (ports 80/443). *Never* expose PostgreSQL, Redis, or Node.js directly to the internet.   |
| **WAF Integration**      | **(Presentation Goal):** Ensure the application rests behind a Web Application Firewall (WAF) to perform deep packet inspection of payloads.      |
| **Topology Isolation**   | Bind the Node.js backend to `127.0.0.1:3001`. This limits access exclusively to Nginx, dramatically shrinking the direct attack surface.            |
| **Database Protection**  | Isolate PostgreSQL within a Docker bridge network. Secure volumes with restricted permissions to prevent unauthorized host-level data access.       |
| **Cache Security**       | Confine Redis strictly to internal networks. External exposure of Redis could lead to session hijacking and cache poisoning.                      |

### 4.2 Application & Cryptographic Defenses

| **Control Area**                 | **Hardening Action Implemented** |
|----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| **Nginx Reverse Proxy**          | Position Nginx as the primary public edge. It sanitizes requests and only permits traffic to explicitly defined `/api` endpoints.                 |
| **HTTPS Enforcement**            | Implement a mandatory 301 redirect on Port 80 to force all user sessions, credentials, and order data over encrypted Port 443 channels.           |
| **TLS Hardening**                | Disable legacy SSL protocols (SSLv3, TLS 1.0, TLS 1.1). Enforce **TLSv1.2 and TLSv1.3** utilizing robust `ECDHE/GCM` cipher suites.               |
| **Certificate Management**       | Replace local lab certificates with trusted CA-signed certificates (e.g., Let's Encrypt) prior to production deployment. Automate renewals.       |
| **Secrets Management**           | Explicitly ignore `.env` files via `.gitignore`. Never commit database credentials, JWT keys, or API secrets to version control repositories.     |
| **JWT Session Integrity**        | Sign JSON Web Tokens with a highly entropic cryptographic secret. The backend drops any request containing a tampered or invalid JWT signature.   |
| **Rate Limiting**                | Apply aggressive rate-limiting thresholds to authentication routes to mitigate brute-force attacks, alongside standard limits for general API use.|
| **Strict Input Validation**      | Enforce server-side schema validation (via the `zod` library) before data reaches PostgreSQL. Never blindly trust client-side frontend validation.|
| **Security Headers (Helmet)**    | Inject protective HTTP response headers via Helmet middleware, actively defending against XSS, clickjacking, and MIME-sniffing vulnerabilities.   |
| **Credential Hashing**           | Passwords are one-way hashed and salted using **Bcrypt**. The database itself holds zero knowledge of a user's true plaintext password.           |
| **Least Privilege & Logging**    | Restrict database service accounts to necessary tables. Regularly audit `/var/log/nginx/access.log` and docker application logs for anomalies.    |

### 4.3 Ongoing Maintenance Routine

To ensure security longevity, administrators must adhere to the following checklist:
- [ ] Execute weekly system and dependency updates.
- [ ] Monitor container resource health and memory leaks using `sudo docker ps` and `docker compose logs`.
- [ ] Back up the persistent PostgreSQL Docker volume before modifying schemas.
- [ ] Rotate cryptographic secrets (`JWT_SECRET`, `SESSION_SECRET`) routinely.
- [ ] Continually verify that firewall routing safely passes through the designated WAF before striking the DMZ web server.

---

## 5. Final Summary

The ZenShop e-commerce platform has been successfully engineered, deployed, and secured within the local Proxmox / NetLab DMZ infrastructure. 

The React frontend reliably serves end-users over the verified domain (`matcsecdesignc.com`), seamlessly retrieving dynamic product data from the containerized Node.js backend and PostgreSQL database. Nginx functions precisely as designed: terminating HTTPS encryption, enforcing strong cryptography, and operating as a secure reverse proxy to shield internal services from the public perimeter.

By satisfying detailed installation methodologies, comprehensive configuration documentation, and an actionable hardening strategy, this project fully aligns with enterprise security design requirements and is ready for final presentation.
