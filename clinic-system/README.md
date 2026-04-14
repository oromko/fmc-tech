
# Family Clinic System

A comprehensive healthcare management solution for family clinics.

## Features

- 👥 **User Management** - Admin, Doctors, Patients, Lab Technicians, Receptionists
- 📅 **Appointment Scheduling** - Book, manage, and track appointments
- 🧪 **Laboratory Management** - Lab requests, results, and verification workflow
- 📜 **Medical Certificates** - Fitness, sick-leave, disability, and medical reports
- 💰 **Billing & Invoices** - Multi-item invoices with multiple payment methods
- 📊 **HMIS Reports** - Daily summaries, financial reports, and analytics
- 🔐 **Secure Authentication** - JWT-based auth with role-based access control

## Quick Start

### Using Docker (Recommended)

```bash
docker-compose up -d
```

### Manual Setup

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

Access the application at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Documentation

- [Quick Start Guide](docs/QUICKSTART.md)
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)

## Tech Stack

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication

**Frontend:**
- React + Vite
- React Router
- Context API for state management

## License

MIT License - see [LICENSE](LICENSE) file for details

