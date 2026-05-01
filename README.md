# ZenShop Developer Handoff Guide

![Status](https://img.shields.io/badge/Status-Live-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## 1. Overview
ZenShop is a full-stack e-commerce application designed with a security-first approach. It demonstrates secure coding practices, role-based access control, and robust application design. The platform is built using a modern stack:
- **Frontend**: React + Vite (TailwindCSS)
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (managed via Prisma ORM)
- **Caching**: Redis
- **Infrastructure**: Docker & Docker Compose
- **Production Server**: Nginx (Reverse Proxy) & HTTPS (Certbot/Let's Encrypt)

## 2. Requirements
To run this project, you will need the following installed on your machine:
- Node.js (v18 or higher)
- Docker and Docker Compose
- PostgreSQL and Redis (if running manually without Docker)
- Nginx (for production deployment)
- Certbot/Let's Encrypt (for HTTPS setup)

## 3. Environment Setup
The project relies on environment variables for configuration. 

1. Locate the `.env.example` file in the root directory.
2. Copy it to create your active `.env` file:
   ```bash
   cp .env.example .env
   ```
3. Update the variables in `.env` as needed. The required variables are:
   - `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/zenshop` (or your actual DB string)
   - `JWT_SECRET=<your_jwt_secret>`
   - `NODE_ENV=development` (change to `production` on the server)
   - `SESSION_SECRET=<your_session_secret>`

## 4. Fastest Setup With Docker
Docker Compose is the easiest way to spin up the entire stack, including PostgreSQL, Redis, and the Backend API.

1. **Clone the repository:**
   ```bash
   git clone git@github.com:jbhuiyan-matc/ZenShop.git
   cd ZenShop
   ```
2. **Create the `.env` file:**
   ```bash
   cp .env.example .env
   ```
3. **Start the containers in detached mode:**
   ```bash
   docker-compose up -d
   ```
4. **Initialize the Database:**
   Run Prisma migrations and the seed script inside the backend container to set up tables and initial data:
   ```bash
   docker-compose exec zenshop-backend npx prisma generate
   docker-compose exec zenshop-backend npx prisma migrate deploy
   docker-compose exec zenshop-backend npm run seed
   ```
5. **Check Status and Logs:**
   - To see running containers: `docker-compose ps`
   - To view live logs: `docker-compose logs -f`
6. **Access URLs:**
   - Backend API: `http://localhost:3001`
   - You still need to run the frontend locally (see step 5) or access via Nginx if in production.

## 5. Manual Local Development Setup
If you prefer running the application without Docker, ensure your local PostgreSQL and Redis servers are running.

1. **Backend Setup:**
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate dev
   npm run seed
   npm run dev
   ```
   The backend will start at `http://localhost:3001`.

2. **Frontend Setup:**
   In a new terminal:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The frontend will start at `http://localhost:5173` (default Vite port) or `http://localhost:3000` depending on your Vite config.

## 6. Database Setup
The application uses Prisma for database management.

- **Generate Client:** Creates the Prisma Client based on `schema.prisma`.
  ```bash
  npx prisma generate
  ```
- **Run Migrations:** Applies database schema changes.
  - Local dev: `npx prisma migrate dev`
  - Production: `npx prisma migrate deploy`
- **Seed Data:** Populates the database with initial categories, products, and an admin user.
  ```bash
  npm run seed
  ```
- **Verify Data:** Log in to the frontend using the admin credentials to verify the seeded data.

## 7. Production Server Deployment
To deploy ZenShop on a Linux server:

1. **Prepare the server:** Install Docker, Docker Compose, Node.js, and Git.
2. **Pull the latest code:**
   ```bash
   git clone git@github.com:jbhuiyan-matc/ZenShop.git
   cd ZenShop
   ```
3. **Configure `.env`:** Copy `.env.example` to `.env` and set production secrets, DB URL, and `NODE_ENV=production`.
4. **Build and Start Docker Containers:**
   ```bash
   docker-compose up -d --build
   ```
   *Note: `docker-compose.yml` is configured with `restart: always`, so containers will auto-restart if the server reboots.*
5. **Restarting Services after changes:**
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

## 8. Nginx Reverse Proxy
To expose the application securely in production, configure Nginx to serve the static frontend and proxy API requests to the backend.

1. **Create the Nginx config:**
   ```bash
   sudo nano /etc/nginx/sites-available/zenshop
   ```
2. **Practical Configuration:** (Replace `<your_domain>` with your actual domain)
   ```nginx
   server {
       listen 80;
       server_name <your_domain> www.<your_domain>;
       return 301 https://$host$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name <your_domain> www.<your_domain>;

       # Note: Let's Encrypt will automatically add SSL certificate paths here.

       root /var/www/zenshop;
       index index.html;

       location /api {
           proxy_pass http://127.0.0.1:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```
3. **Enable and Test the site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/zenshop /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## 9. HTTPS / SSL
Secure the site using Let's Encrypt and Certbot.

1. **Run Certbot:**
   ```bash
   sudo certbot --nginx -d <your_domain> -d www.<your_domain>
   ```
   *Certbot will automatically configure the SSL paths in your Nginx config and enable HTTPS redirection.*
2. **Note on Lab Certificates:** If you are testing locally or in a lab environment, the repository includes self-signed CA certificates (`zenshop-lab-ca.pem`, etc.) which can be loaded into your browser to trust the local HTTPS setup. Please refer to [HTTPS_SETUP.md](./HTTPS_SETUP.md) for details.

## 10. Admin/User Access
Admin access is automatically provisioned during the database seeding process.

- **Admin Email:** `admin@zenshop.com`
- **Admin Password:** `admin123`

You do not need to invent fake accounts; running `npm run seed` or `docker-compose exec zenshop-backend npm run seed` will create this admin user for you to test inventory management.

## 11. Common Commands

| Action | Command |
|--------|---------|
| **Start App (Docker)** | `docker-compose up -d` |
| **Stop App (Docker)** | `docker-compose down` |
| **Rebuild App (Docker)** | `docker-compose up -d --build` |
| **View Logs (Docker)** | `docker-compose logs -f` |
| **Restart Backend** | `cd backend && npm run dev` |
| **Run Migrations** | `npx prisma migrate dev` (local) or `npx prisma migrate deploy` (prod) |
| **Run Seed** | `npm run seed` (local) or `docker-compose exec zenshop-backend npm run seed` |

## Project Structure

```
/
├── frontend/           # React + Vite application (UI)
├── backend/            # Node.js Express API (Server)
│   └── prisma/         # Database schema & migrations
└── package.json        # Root build config for deployment
```

## Architecture Diagram
![Network Architecture Diagram](./network-diagram.png)
Update:
<img width="1220" height="737" alt="image" src="https://github.com/user-attachments/assets/f768cac4-41db-4b50-a3f4-17d4fe1fae0a" />

## Security Considerations

This application adheres to industry standards to ensure data integrity and user safety:
- **OWASP Top 10 (2021)** compliance.
- **CIS Benchmarks** for server hardening.
- **PCI-DSS** best practices for data handling (non-payment scope).
