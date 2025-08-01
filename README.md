# SocioDent - Dental Appointment Booking App

SocioDent is a comprehensive dental appointment booking application that connects patients with qualified dentists. The platform allows users to book appointments, make payments, and receive email notifications about their dental appointments.

## Features

- User authentication and role-based access (Admin, Doctor, Patient)
- Appointment booking with different consultation types (Virtual, Home, Clinic)
- Doctor assignment based on specialty and location
- Online payment processing with Razorpay
- Email notifications for appointment confirmations and updates
- Admin portal for user and appointment management
- Doctor portal for managing appointments and patient records
- Patient profile with appointment history
- Medical report uploads

## Technology Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: Firebase Realtime Database
- **Authentication**: Firebase Authentication
- **Storage**: Firebase Storage
- **Payment Processing**: Razorpay
- **Email Service**: Nodemailer (backend)

## Installation

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- Firebase account
- Razorpay account (for payment processing)
- SMTP email service credentials

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/sociosmile-with-database.git
   cd sociosmile-with-database
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.template` to `.env` in the root directory
   - Copy `backend/.env.template` to `backend/.env`
   - Fill in the required configuration values

4. Start the backend server:
   ```
   cd backend
   node app.js
   ```

5. Start the frontend development server:
   ```
   npm run dev
   ```

6. Access the application at `http://localhost:8081`

## Project Structure

- `/src` - Frontend source code
  - `/components` - React components
  - `/pages` - Page components
  - `/services` - Service layer for API interactions
  - `/hooks` - Custom React hooks
  - `/context` - React context providers
  - `/utils` - Utility functions
- `/backend` - Backend server code
  - `/routes` - API routes
  - `/tests` - Backend tests
- `/public` - Static assets
- `/tests` - Frontend and integration tests

## Email Notification Features

SocioDent includes a comprehensive email notification system that keeps users informed about their dental appointments:

1. **Appointment Confirmation Emails** - Sent after booking an appointment
2. **Doctor Assignment Notifications** - Sent when a doctor is assigned to an appointment
3. **Payment Receipt Emails** - Sent after successful payment processing

All emails are styled with responsive HTML templates and are sent through a secure backend API.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributors

- Sreeram R - Lead Developer

---

© 2025 SocioDent. All rights reserved.
