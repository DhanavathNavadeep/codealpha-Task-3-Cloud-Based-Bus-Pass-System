# User & Administrator Manual

Welcome to the **Cloud-Based Bus Pass Management System**! This guide details how passengers and transit administrators can interact with the system.

---

## 1. Passenger Guide

### Registering an Account
1. Open the application homepage (`http://localhost:3000` or `http://localhost`).
2. Click **Get Started** or **Register**.
3. Fill in your full name, email address, phone number, and password.
4. Click **Register Account**.

### Applying for a Bus Pass
1. Log in to your passenger dashboard.
2. Click **Apply New Bus Pass**.
3. Select your desired bus route from the dropdown. The route stops and base monthly price will update automatically.
4. Choose your pass duration:
   - **Monthly** (Standard rate)
   - **Quarterly** (10% Discount)
   - **Half-Yearly** (15% Discount)
   - **Annual** (20% Discount)
5. Select your pass start date and upload an ID document if required.
6. Click **Proceed to Online Payment**.

### Completing Payment & Downloading Digital Pass
1. Choose your payment method (UPI, Card, or Net Banking).
2. Click **Pay Now**.
3. Once approved, your pass will appear under **My Passes**.
4. Click **Download PDF Pass** to save a printable copy or present the QR code on your mobile screen during ticket inspection.

---

## 2. Administrator Guide

### Accessing the Admin Console
1. Log in using administrator credentials (`admin@buspass.com` / `Admin@123`).
2. You will be automatically routed to the **Admin Management Console** (`/admin`).

### Reviewing & Verifying Pass Applications
1. Go to **Verify Passes** (`/admin/passes`).
2. Filter applications by **Pending**.
3. Click **Review** on an application to view passenger details, uploaded identity proof, and payment status.
4. Enter optional remarks and click **Approve** or **Reject**.

### Managing Routes & Fares
1. Go to **Manage Routes** (`/admin/routes`).
2. Click **Add New Route** to create a new transit line with custom stops and monthly base price.
3. Edit existing routes or deactivate unused routes instantly.

### Viewing Analytics & Exporting Reports
1. Navigate to **Analytics & Audit** (`/admin/reports`).
2. Inspect the real-time security audit log stream.
3. Click **Export Audit CSV** to download a spreadsheet report.
