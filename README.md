# ZenShop

**A Secure E-Commerce Platform**
*Built for the Security Design Class Project*

![Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## About

ZenShop is a full-stack e-commerce application designed with a security-first approach. It demonstrates secure coding practices, network segmentation, and robust infrastructure design.

The platform features:
- Product browsing and search
- Shopping cart and checkout simulation
- Secure authentication and authorization
- Admin portal for inventory management

## Recent Updates

- **Streamlined UX**: Home page now features direct product browsing with category filters and search, replacing the traditional hero section.
- **Stability Improvements**: Fixed authentication state restoration to prevent unnecessary re-logins.
- **Bug Fixes**: Resolved cart count discrepancies and button routing issues.

## Architecture

ZenShop utilizes a modern microservices-inspired architecture, ensuring separation of concerns and scalability.

### Tech Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend** | React, Vite, TypeScript | Fast, type-safe UI with TailwindCSS. |
| **Backend** | Node.js, Express | RESTful API with robust security middleware. |
| **Database** | PostgreSQL + Prisma | Relational data storage with type-safe ORM. |
| **Auth** | Keycloak (OIDC) | Enterprise-grade identity and access management. |
| **Infra** | Docker, Nginx, ModSecurity | Containerized deployment with WAF protection. |

### Network Architecture

The diagram below illustrates our network segmentation, showing the DMZ, internal zones, and security boundaries.

![ZenShop Network Diagram](./V3drawio.png)

## Features

### User Experience
- **Intuitive Interface**: Clean and responsive design.
- **Product Catalog**: View products with detailed descriptions and images.
- **Shopping Cart**: Real-time cart management.

### Security & Administration
- **Role-Based Access Control (RBAC)**: Distinct permissions for Customers vs. Admins.
- **Security Controls**:
    - CSRF & XSS Protection
    - Rate Limiting to prevent abuse
    - Secure Headers (Helmet)
- **Audit Logging**: Comprehensive tracking of sensitive actions.

## Quick Start (Recommended)

The easiest way to run ZenShop is using Docker. This will set up the frontend, backend, database, and security services automatically.

### Prerequisites
- Docker & Docker Compose
- Git

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/jbhuiyan-matc/ZenShop.git
    cd ZenShop
    ```

2.  **Run the Start Script**
    *   **macOS / Linux:**
        ```bash
        chmod +x start-local.sh
        ./start-local.sh
        ```
    *   **Windows (Command Prompt or PowerShell):**
        ```cmd
        .\start-local.bat
        ```
    
    *Or manually:*
    ```bash
    docker-compose up -d --build
    ```

3.  **Access the Application**
    - Frontend: [http://localhost:3000](http://localhost:3000)
    - Backend API: [http://localhost:5001](http://localhost:5001)

## Manual Development Setup

If you prefer to run services individually without Docker (except the database), follow these steps:

1.  **Start the Database**
    ```bash
    docker-compose up -d db
    ```

2.  **Install & Run Backend**
    ```bash
    cd backend
    npm install
    # Run migrations and seed data
    npx prisma generate
    npx prisma migrate dev
    npm run seed
    # Start server
    npm run dev
    ```

3.  **Install & Run Frontend**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

## Deployment

### Prerequisites

- A server with Docker and Docker Compose installed
- Domain name (optional for production deployment)
- SSL certificates (or use Let's Encrypt)

### Production Deployment Steps

1. Clone the repository on your production server:
   ```bash
   git clone https://github.com/jbhuiyan-matc/ZenShop.git
   cd ZenShop
   ```

2. Create a production environment file:
   ```bash
   cp .env.example .env
   # Edit .env with your production settings
   nano .env
   ```

3. Add SSL certificates:
   ```bash
   mkdir -p infra/nginx/ssl
   # Add your SSL certificates to this directory
   # fullchain.pem and privkey.pem
   ```

4. Run the deployment script:
   ```bash
   ./deploy.sh
   ```

5. Configure your firewall according to the network architecture diagram

### Deployment Files

- `docker-compose.prod.yml`: Production container configuration
- `deploy.sh`: Deployment automation script
- `infra/nginx/nginx.prod.conf`: Production-ready Nginx configuration with security headers

## Project Structure

```
/
├── frontend/           # React + Vite application (UI)
├── backend/            # Node.js Express API (Server)
├── infra/              # Docker, Nginx, WAF configs
└── docs/               # Documentation, Diagrams, Threat Models
```

## Security Considerations

This application adheres to industry standards to ensure data integrity and user safety:
- **OWASP Top 10 (2021)** compliance.
- **CIS Benchmarks** for server hardening.
- **PCI-DSS** best practices for data handling (non-payment scope).

## License

This project is licensed under the [MIT License](LICENSE).
