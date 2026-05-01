# ZenShop Security Architecture

This document outlines the security measures and best practices implemented across the ZenShop application.

## 🔒 TL;DR: How Security Works (The Simple Version)

If you're wondering how a user's data stays safe as they use ZenShop, here is the journey:

1. **The Secure Tunnel (HTTPS):** When a user types `matcsecdesignc.com`, our web server (Nginx) immediately forces them into a secure, encrypted tunnel. No one can eavesdrop on their connection.
2. **The Front Door (Rate Limiting & CORS):** Before any request reaches the actual application, our backend checks two things: "Is this request coming from our actual website?" (CORS) and "Is this user trying to spam us or guess passwords rapidly?" (Rate Limiting). If they are spamming, they get temporarily blocked.
3. **The Scrambled Passwords (Bcrypt):** When a user creates an account, we don't save their password. Instead, we run it through a complex math formula (hashing) and save the scrambled result. Even if a hacker stole our database, they wouldn't know the passwords.
4. **The VIP Pass (JWT):** When a user logs in successfully, we hand their browser a digital VIP pass (a JSON Web Token). The browser holds onto this pass and shows it to the server every time the user wants to view their cart or make an order.
5. **The Bouncer (Helmet):** While the user browses, our server sends strict rules to their browser (Content Security Policy) saying exactly which images, scripts, and fonts are allowed to load, preventing malicious code from sneaking in.
6. **The Expired Pass:** If the VIP pass expires, our frontend automatically notices the rejection from the server, throws away the old pass, and redirects the user back to the login page to verify who they are.

---

## 1. Infrastructure & Network Security (Nginx)

The application sits behind an Nginx reverse proxy that acts as the first line of defense:

- **HTTPS Enforcement:** All HTTP traffic on port 80 is strictly redirected to HTTPS (port 443), ensuring all data in transit is encrypted.
- **Modern TLS Configuration:** 
  - Restricts connections to secure protocols only (`TLSv1.2` and `TLSv1.3`).
  - Implements a strong, explicit list of ciphers (e.g., `ECDHE-ECDSA-AES128-GCM-SHA256`).
- **Topology Hiding:** The backend Node.js API runs on local port `3001` and is never exposed directly to the internet. Nginx acts as a reverse proxy, filtering requests before they hit the application layer.

## 2. Application Security (Node.js / Express Backend)

The backend utilizes several middleware and architectural patterns to protect against common web vulnerabilities (e.g., OWASP Top 10):

### HTTP Security Headers (Helmet)
We use `helmet` to automatically set secure HTTP headers:
- **Content Security Policy (CSP):** Strictly defines which dynamic resources are allowed to load, mitigating Cross-Site Scripting (XSS) attacks. It restricts scripts, styles, and images to trusted origins.
- **Cross-Origin Resource Policy (CORP):** Set to `cross-origin` to protect against cross-origin information leaks.

### Cross-Origin Resource Sharing (CORS)
CORS is explicitly configured to only allow requests from trusted origins (our localhost environments and production domain `matcsecdesignc.com`). It enforces allowed HTTP methods (`GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`) and headers.

### Rate Limiting (DDoS & Brute Force Protection)
Granular rate limiting is implemented to prevent abuse and brute-force attacks:
- **Auth Routes (`/api/auth`):** Strict limit of 10 requests per 15 minutes to prevent password brute-forcing and credential stuffing.
- **Transactional Routes (`/api/cart`, `/api/orders`):** Limited to 100 requests per 15 minutes.
- **Global API Baseline:** Default limit of 200 requests per 15 minutes per IP.
- **Public Read Routes:** Generous limit of 500 requests per 15 minutes for catalog browsing.

### Data Validation
All incoming request payloads are strictly validated using **Zod** before hitting business logic. For example, login and registration routes enforce email formats and minimum password lengths, mitigating injection and malformed data attacks.

### Secure Error Handling
A custom global error handler ensures that stack traces and sensitive internal application details are never leaked to the client when `NODE_ENV` is set to `production`.

## 3. Authentication & Data Security

### Password Cryptography
Passwords are never stored in plain text. We use **bcrypt** (with a cost factor of 10) to salt and hash passwords during registration. 

### JSON Web Tokens (JWT)
- The application uses stateless authentication via JWTs. 
- Upon successful login, a signed JWT containing the user's `id`, `email`, and `role` is issued using a secret key (`JWT_SECRET`).
- Protected routes require a valid Bearer token in the `Authorization` header.

## 4. Frontend Security (React)

- **Token Management:** JWTs are stored in the browser's `localStorage` or `sessionStorage` and attached to API requests via an API wrapper.
- **Session Expiration Handling:** The frontend API interceptor globally monitors for `401 Unauthorized` responses. If a token expires or is deemed invalid by the backend, the frontend automatically purges the local tokens and forces a redirect to the login page to re-authenticate the user.
