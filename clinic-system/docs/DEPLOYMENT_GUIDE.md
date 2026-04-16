# Family Clinic System - Deployment Guide

## Overview

The Family Clinic System is a comprehensive healthcare management solution built with Node.js/Express backend and React/Vite frontend. It includes features for:

- User Management (Admin, Doctors, Patients, Lab Technicians)
- Appointment Scheduling
- Medical Records Management
- Laboratory Request & Results Processing
- Medical Certificate Generation
- Invoice & Billing Management
- HMIS Reports & Analytics

## Prerequisites

- Node.js v16+ 
- npm v8+
- MongoDB v5+ or MongoDB Atlas account
- Docker & Docker Compose (optional, for containerized deployment)

## Project Structure

```
clinic-system/
├── backend/
│   ├── models/           # Mongoose models
│   ├── routes/           # API route definitions
│   ├── controllers/      # Business logic
│   ├── middleware/       # Auth & validation middleware
│   ├── config/           # Database configuration
│   └── server.js         # Application entry point
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React context providers
│   │   ├── utils/        # Utility functions
│   │   └── styles/       # CSS styles
│   └── public/
├── docs/                  # Documentation files
├── scripts/               # Automation scripts
├── init.sql              # SQL schema reference
├── docker-compose.yml    # Docker configuration
└── .env.example          # Environment variables template
```

## Quick Start

### 1. Clone and Setup

```bash
cd clinic-system
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB connection string
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/api/health

## Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (Admin)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin)

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment
- `GET /api/appointments/date/:date` - Get appointments by date
- `GET /api/appointments/doctor/:doctorId` - Get doctor's appointments
- `GET /api/appointments/patient/:patientId` - Get patient's appointments

### Lab Requests
- `GET /api/lab-requests` - Get all lab requests
- `GET /api/lab-requests/:id` - Get lab request by ID
- `POST /api/lab-requests` - Create lab request (Doctor/Admin)
- `PUT /api/lab-requests/:id` - Update lab request
- `POST /api/lab-requests/:id/results` - Add results (Lab Technician)
- `POST /api/lab-requests/:id/verify` - Verify results (Doctor)
- `DELETE /api/lab-requests/:id` - Cancel lab request

### Medical Certificates
- `GET /api/certificates` - Get all certificates
- `GET /api/certificates/:id` - Get certificate by ID
- `POST /api/certificates` - Create certificate (Doctor/Admin)
- `PUT /api/certificates/:id` - Update certificate
- `POST /api/certificates/:id/revoke` - Revoke certificate
- `POST /api/certificates/:id/print` - Print certificate

### Invoices
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/:id` - Get invoice by ID
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/:id` - Update invoice
- `POST /api/invoices/:id/payment` - Add payment
- `DELETE /api/invoices/:id` - Cancel invoice
- `GET /api/invoices/stats/financial` - Get financial statistics

### HMIS Reports
- `GET /api/reports/daily` - Daily summary report
- `GET /api/reports/monthly/financial` - Monthly financial report
- `GET /api/reports/demographics` - Patient demographics
- `GET /api/reports/appointments` - Appointment statistics
- `GET /api/reports/lab-tests` - Lab test statistics
- `GET /api/reports/history` - Report history

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/clinic_db
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Database Models

### Core Models
- **User**: Authentication and user management
- **Patient**: Patient demographic information
- **Doctor**: Doctor profiles and specializations
- **Appointment**: Scheduling and status tracking

### Advanced Features
- **LabRequest**: Laboratory test requests with auto-generated numbers (LAB-YYYYMMDD-XXXX)
- **LabTestCatalog**: Test catalog with reference ranges
- **MedicalCertificate**: Certificates (fitness, sick-leave, disability, medical-report) with auto-numbers (CERT-YYYYMMDD-XXXX)
- **Invoice**: Multi-item billing with 5 payment methods
- **HMISReport**: Analytics and reporting

## Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- CORS protection
- Input validation

## Backup & Restore

### Backup Script
```bash
./scripts/backup.sh
```

### Restore Script
```bash
./scripts/restore.sh <backup_file>
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Verify MongoDB is running
   - Check MONGODB_URI in .env

2. **Port Already in Use**
   - Change PORT in backend/.env
   - Update FRONTEND_URL accordingly

3. **Build Errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

## Support

For issues and feature requests, please contact the development team.

## License

MIT License - See LICENSE file for details
