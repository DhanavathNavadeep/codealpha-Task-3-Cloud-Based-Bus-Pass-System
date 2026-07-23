# REST API Specification & Endpoint Documentation

The **Cloud-Based Bus Pass Management System** provides a secure REST API protected by JSON Web Tokens (JWT).

Base URL: `http://localhost:5000/api`

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /auth/register`
Creates a new user account.
- **Request Body**:
  ```json
  {
    "full_name": "Jane Smith",
    "email": "jane@example.com",
    "password": "Password123",
    "phone": "+15550192831",
    "address": "123 Park Ave"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "message": "Registration successful.",
    "access_token": "<JWT_TOKEN>",
    "user": { "id": 2, "full_name": "Jane Smith", "email": "jane@example.com", "role": "user" }
  }
  ```

### `POST /auth/login`
Authenticates existing credentials.
- **Response (200 OK)**: Returns JWT bearer token and user metadata.

### `POST /auth/forgot-password`
Triggers password reset flow.

---

## 2. Bus Pass Endpoints (`/api/passes`)

### `POST /passes/calculate-fare`
Calculates dynamic fare based on route and pass duration.
- **Request Body**:
  ```json
  {
    "route_id": 1,
    "pass_type": "Quarterly"
  }
  ```
- **Response (200 OK)**: Returns total fare with discount multiplier applied.

### `POST /passes/apply` (Bearer Auth)
Applies for a new pass with optional document upload (`multipart/form-data`).

### `GET /passes/my-passes` (Bearer Auth)
Retrieves pass history and active digital passes for current passenger.

### `GET /passes/<id>/pdf` (Bearer Auth)
Generates and downloads printable PDF receipt for specified pass.

---

## 3. Payments Simulation Endpoints (`/api/payments`)

### `POST /payments/process` (Bearer Auth)
Simulates instant payment checkout.
- **Request Body**:
  ```json
  {
    "pass_id": 1,
    "payment_method": "UPI",
    "simulate_failure": false
  }
  ```

---

## 4. Admin Management Endpoints (`/api/admin`)

### `GET /admin/passes?status=pending` (Admin Auth)
Lists pass verification queue.

### `POST /admin/passes/<id>/verify` (Admin Auth)
Approve or reject pass application.

### `GET /analytics/dashboard` (Admin Auth)
Returns revenue, route demand metrics, and pass status breakdown.
