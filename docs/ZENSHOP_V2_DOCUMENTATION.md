# ZenShop V2 Documentation

## 1. Project Overview
ZenShop V2 is a secure, full-stack e-commerce application demonstrating modern web development practices, robust architecture, and a security-first design. It builds upon the original ZenShop foundation to deliver a more maintainable, scalable, and polished experience.

## 2. What ZenShop Does
ZenShop allows users to:
- Browse and search a catalog of products
- Filter products by category
- Manage a shopping cart
- Complete a simulated checkout process
- View order history
- (Admins) Manage the product catalog and view store statistics

## 3. V2 Architecture Overview
ZenShop V2 implements a strict separation of concerns:
- **Frontend:** React SPA built with Vite and styled with Tailwind CSS. It uses a Context API for global state management and a custom Axios instance for API communication.
- **Backend:** Node.js Express API using a layered architecture (Routes -> Controllers -> Services -> Database).
- **Database:** PostgreSQL accessed via Prisma ORM. Redis is used for caching API responses.

## 4. Folder and File Structure Explanation
```
/
├── frontend/           # React application
│   ├── src/
│   │   ├── components/ # Reusable UI components (e.g., ui/Button.jsx, ui/Card.jsx)
│   │   ├── pages/      # Page-level components
│   │   ├── services/   # API communication logic
│   │   └── store/      # Global state context
├── backend/            # Node.js Express API
│   ├── src/
│   │   ├── routes/      # Express route definitions & Zod validation schemas
│   │   ├── controllers/ # HTTP request/response handling
│   │   ├── services/    # Core business logic and database interactions
│   │   ├── middleware/  # Auth, validation, and caching middleware
│   │   └── utils/       # Logger, database client, Redis client
│   └── prisma/         # Database schema and migrations
└── docs/               # Project documentation
```

## 5. Frontend Architecture
The frontend in V2 has been refactored to use reusable UI components (Buttons, Inputs, Cards) located in `src/components/ui/`. This ensures visual consistency and reduces code duplication. The application uses React Router for navigation and a custom Context (`AppContext.jsx`) to manage the user session and shopping cart state globally.

## 6. Backend Architecture
The V2 backend strictly separates concerns:
1. **Routes:** Define endpoints, apply middleware (Auth, Admin, Cache), and perform Zod input validation.
2. **Controllers:** Extract data from the request, call the appropriate Service, and format the HTTP response.
3. **Services:** Contain the pure business logic and interact with Prisma. They throw specific errors which the Controllers catch and handle.

## 7. Database Design and Key Models
- **User:** Manages authentication and roles (USER, ADMIN).
- **Product & Category:** Manages the store catalog. Products belong to a Category.
- **CartItem:** Tracks items currently in a user's cart.
- **Order & OrderItem:** Records completed purchases and the specific items bought.
- **AuditLog:** Tracks sensitive actions (primarily admin actions).

## 8. Authentication Flow
Authentication uses JWT (JSON Web Tokens). 
1. The user submits credentials to `/api/auth/login`.
2. The backend verifies the password using `bcrypt`.
3. A JWT is generated and returned to the client.
4. The frontend stores the token (in `localStorage` or `sessionStorage`) and attaches it as a `Bearer` token in the `Authorization` header for subsequent requests.

## 9. Authorization / RBAC Flow
Role-Based Access Control is enforced via middleware:
- `isAuthenticated`: Verifies the JWT and attaches the user object to the request. Required for cart and order operations.
- `isAdmin`: Checks if `req.user.role === 'ADMIN'`. Required for catalog management and viewing stats.

## 10. API Route Documentation
### Auth
- `POST /api/auth/login`: Authenticate user
- `POST /api/auth/register`: Create new user
- `GET /api/auth/me`: Get current user profile

### Products
- `GET /api/products`: List products (supports `?search=` and `?category=`)
- `GET /api/products/:id`: Get single product
- `POST /api/products`: Create product (Admin)
- `PUT /api/products/:id`: Update product (Admin)
- `DELETE /api/products/:id`: Delete product (Admin)

### Categories
- `GET /api/categories`: List categories
- `GET /api/categories/:id`: Get single category
- `POST /api/categories`: Create category (Admin)
- `PUT /api/categories/:id`: Update category (Admin)
- `DELETE /api/categories/:id`: Delete category (Admin)

### Cart
- `GET /api/cart`: Get current user's cart
- `POST /api/cart`: Add item to cart
- `PUT /api/cart/:id`: Update item quantity
- `DELETE /api/cart/:id`: Remove item
- `DELETE /api/cart`: Clear cart

### Orders
- `GET /api/orders`: Get user's order history
- `GET /api/orders/:id`: Get single order details
- `POST /api/orders`: Place a new order

### Admin
- `GET /api/admin/stats`: Get dashboard statistics (Admin)

## 11. Admin System Overview
The Admin Dashboard (`/admin`) provides a high-level view of store performance (Total Revenue, Orders, Active Products, Users). It allows administrators to view recent orders and manage the product catalog (add, edit, delete products).

## 12. Security Measures Implemented
- **Helmet:** Sets secure HTTP headers.
- **Rate Limiting:** Protects the API against brute-force attacks.
- **CORS:** Restricts cross-origin requests to trusted domains.
- **JWT Verification:** Secures API endpoints.
- **Password Hashing:** Uses `bcrypt` (cost factor 10) for secure password storage.
- **Prisma Transactions:** Ensures database consistency during complex operations (e.g., checkout).

## 13. Validation Strategy
**Zod** is used for strict schema validation on the backend. Request bodies (e.g., creating a product, registering a user) are validated in middleware before reaching the controller. This ensures type safety and prevents malformed data from entering the business logic.

## 14. Logging / audit logging overview
- **General Logging:** Uses `winston` and `morgan` to log HTTP requests, warnings, and errors to the console and log files (`logs/combined.log`, `logs/error.log`).
- **Audit Logging:** Sensitive actions (like creating/deleting products) are explicitly logged for security tracking.

## 15. Environment Variables and Configuration
Key environment variables required:
- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_SECRET`: Secret key for signing tokens.
- `PORT`: Backend server port (default 3001).
- `REDIS_URL`: Redis connection string (optional, defaults to localhost).

## 16. Local Setup Instructions
1. Clone the repository.
2. Install dependencies in both `frontend` and `backend` folders using `npm install`.
3. Ensure PostgreSQL and Redis are running locally or via Docker.
4. In `backend`, copy `.env.example` to `.env` and configure `DATABASE_URL`.
5. Run `npx prisma generate` and `npx prisma migrate dev` in the `backend` folder.

## 17. Development Workflow
- Backend: `cd backend && npm run dev` (starts on port 3001).
- Frontend: `cd frontend && npm run dev` (starts Vite dev server).

## 18. Deployment Guidance
- Build the frontend: `cd frontend && npm run build`.
- The backend is configured to serve the static frontend files in production mode if `NODE_ENV=production`.
- Use a process manager like PM2 or Docker Compose for backend deployment.

## 19. Production Readiness Notes
- Ensure `JWT_SECRET` is strong and unique in production.
- Configure Nginx to proxy requests to the backend securely over HTTPS.
- Use strong database passwords and restrict database access to the backend server.

## 20. Changelog / V2 Improvements
- **Architecture:** Implemented full Controller/Service layer separation in the backend.
- **Frontend UI:** Extracted reusable `Button`, `Input`, and `Card` components.
- **UX:** Added loading skeletons, polished empty states, and improved the aesthetic consistency of all pages.
- **Database:** Wrapped the checkout flow in a Prisma transaction to ensure stock integrity.
- **Security:** Standardized Zod validation across all mutation endpoints.

## 21. Future Improvement Opportunities
- Implement pagination for products and orders.
- Add real payment gateway integration (e.g., Stripe).
- Implement email notifications for order confirmations and password resets.
- Add comprehensive unit and integration testing suites.
