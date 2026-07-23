# Relational Database Schema & Entities

The system uses a relational database architecture (compatible with SQLite, PostgreSQL, and MySQL).

---

## Entity Relationship Diagram (ERD)

```
┌──────────────────┐            ┌──────────────────┐
│      USERS       │ 1        * │    BUS_PASSES    │
├──────────────────┤───────────┼──────────────────┤
│ id (PK)          │            │ id (PK)          │
│ email (UQ)       │            │ pass_number (UQ) │
│ password_hash    │            │ user_id (FK)     │
│ role (user/admin)│            │ route_id (FK)    │
│ status           │            │ pass_type        │
└────────┬─────────┘            │ status           │
         │                      │ qr_code_token    │
         │ 1                    └────────┬─────────┘
         │                               │ 1
         │ *                             │ *
┌────────▼─────────┐            ┌────────▼─────────┐
│   AUDIT_LOGS     │            │     PAYMENTS     │
├──────────────────┤            ├──────────────────┤
│ id (PK)          │            │ id (PK)          │
│ user_id (FK)     │            │ transaction_id   │
│ action           │            │ pass_id (FK)     │
│ details          │            │ user_id (FK)     │
│ created_at       │            │ amount           │
└──────────────────┘            │ payment_status   │
                                └──────────────────┘
```

---

## Database Tables & Fields

### 1. `users`
Stores user profile, authentication hashes, and roles.
- `id` (INT, Primary Key, Auto Increment)
- `email` (VARCHAR(120), Unique, Indexed)
- `password_hash` (VARCHAR(255), Bcrypt)
- `role` (VARCHAR(20): `'user'`, `'admin'`)
- `status` (VARCHAR(20): `'active'`, `'suspended'`)

### 2. `routes`
Stores transit bus route definitions, stops, and base monthly fares.
- `id` (INT, Primary Key)
- `route_code` (VARCHAR(20), Unique)
- `route_name` (VARCHAR(100))
- `source` & `destination` (VARCHAR(100))
- `base_price` (FLOAT, Default Monthly Fare)

### 3. `bus_passes`
Stores pass applications, validity dates, QR base64 token, and admin approval status.

### 4. `payments`
Stores transaction IDs, payment methods, and gateway responses.

### 5. `audit_logs`
Tracks system actions, IP addresses, and user activities for security compliance.
