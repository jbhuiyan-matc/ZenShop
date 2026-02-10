# ZenShop

**A Secure E-Commerce Platform**
*Built for the Security Design Class Project*

![Status](https://img.shields.io/badge/Status-Live-success)
![License](https://img.shields.io/badge/License-MIT-blue)

**Live Demo:** [https://zenshop-production.up.railway.app](https://zenshop-production.up.railway.app)

## About

ZenShop is a full-stack e-commerce application designed with a security-first approach. It demonstrates secure coding practices and robust application design.

The platform features:
- Product browsing and search
- Shopping cart and checkout simulation
- Secure authentication and authorization
- Admin portal for inventory management

## Tech Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend** | React | UI built with TailwindCSS. |
| **Backend** | Node.js, Express | RESTful API with security middleware. |
| **Database** | PostgreSQL + Prisma | Managed on Railway. Prisma handles database access safely. |

## Features

### User Experience
- **Intuitive Interface**: Clean and responsive design.
- **Product Catalog**: View products with detailed descriptions and images.
- **Shopping Cart**: Real-time cart management.

## Backend Working Image
<img width="1485" height="797" alt="image" src="https://github.com/user-attachments/assets/8a0783e2-66d0-4858-803e-faacc5d0349e" />


### Security & Administration
- **Role-Based Access Control (RBAC)**: Distinct permissions for Customers vs. Admins.
- **Security Controls**:
    - CSRF & XSS Protection
    - Rate Limiting to prevent abuse
    - Secure Headers (Helmet)
- **Audit Logging**: Comprehensive tracking of sensitive actions.

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL (local instance or cloud)

### Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/jbhuiyan-matc/ZenShop.git
    cd ZenShop
    ```

2.  **Install & Run Backend**
    ```bash
    cd backend
    npm install
    npx prisma generate
    npx prisma migrate dev
    npm run seed
    npm run dev
    ```

3.  **Install & Run Frontend** (in a separate terminal)
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

4.  **Access the Application**
    - Frontend: [http://localhost:3000](http://localhost:3000)
    - Backend API: [http://localhost:5000](http://localhost:5000)

## Project Structure

```
/
├── frontend/           # React + Vite application (UI)
├── backend/            # Node.js Express API (Server)
│   └── prisma/         # Database schema & migrations
└── package.json        # Root build config for deployment
```

## Security Considerations

This application adheres to industry standards to ensure data integrity and user safety:
- **OWASP Top 10 (2021)** compliance.
- **CIS Benchmarks** for server hardening.
- **PCI-DSS** best practices for data handling (non-payment scope).
