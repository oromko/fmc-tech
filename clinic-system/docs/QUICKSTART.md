# Family Clinic System - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd clinic-system
```

### Step 2: Start with Docker (Recommended)

```bash
# One command to start everything
docker-compose up -d
```

Wait 30 seconds for services to initialize, then access:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

### Step 3: Manual Setup (Alternative)

#### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB connection
npm run dev
```

#### Frontend (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```

### Step 4: Create First Admin User

Use the registration page or API:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@clinic.com",
    "password": "admin123",
    "role": "admin"
  }'
```

### Step 5: Login and Explore

1. Navigate to http://localhost:5173
2. Login with your admin credentials
3. Start managing your clinic!

## 📋 Default User Roles

- **admin**: Full system access
- **doctor**: Patient care, appointments, lab requests, certificates
- **lab_technician**: Lab test management and results entry
- **receptionist**: Appointments, patient registration, invoicing
- **cashier**: Payment processing
- **patient**: View own appointments, records, and invoices

## 🔑 Key Features

### 1. Laboratory Management
- Auto-generated lab numbers: `LAB-YYYYMMDD-XXXX`
- Priority levels: routine, urgent, stat
- Automatic abnormal result flagging
- Doctor verification workflow

### 2. Medical Certificates
- 4 types: fitness, sick-leave, disability, medical-report
- Auto-generated numbers: `CERT-YYYYMMDD-XXXX`
- Revocation tracking
- Print count management

### 3. Billing & Invoices
- Multi-item invoices
- 5 payment methods: cash, card, insurance, bank_transfer, mobile_money
- Status tracking: pending → partial → paid
- Financial statistics

### 4. HMIS Reports
- Daily summaries
- Monthly financials
- Patient demographics
- Export tracking

## 🛠️ Common Commands

### Development
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev

# Run tests
npm test
```

### Production Build
```bash
# Backend
cd backend && npm start

# Frontend
cd frontend && npm run build
```

### Database
```bash
# Backup
./scripts/backup.sh

# Restore
./scripts/restore.sh backup-file.tar.gz
```

## 📱 Mobile Responsive

The system is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile devices

## 🔐 Security Best Practices

1. Change default passwords immediately
2. Use strong JWT secrets in production
3. Enable HTTPS in production
4. Regular database backups
5. Keep dependencies updated

## 🆘 Need Help?

- Check `docs/DEPLOYMENT_GUIDE.md` for detailed documentation
- Review API endpoints in the deployment guide
- Check logs: `docker-compose logs -f`

## ✅ Verification Checklist

After setup, verify:
- [ ] Backend health check responds: `http://localhost:5000/api/health`
- [ ] Frontend loads successfully
- [ ] Can register a new user
- [ ] Can login with credentials
- [ ] Database connection is working

---

**Happy Managing! 🏥**
