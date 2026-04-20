const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const LabTestCatalog = require('../models/LabTestCatalog');

const icd11Data = require('../data/icd11.json');
const labCatalogData = require('../data/labCatalog.json');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fmcs';

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out for production)
    // await mongoose.connection.dropDatabase();
    // console.log('🗑️  Database cleared');

    // Seed Admin User
    const adminExists = await User.findOne({ role: 'Admin' });
    if (!adminExists) {
      const admin = await User.create({
        username: 'admin',
        email: 'admin@fmcs.com',
        password: 'Admin123!',
        role: 'Admin',
        profile: {
          firstName: 'System',
          lastName: 'Administrator',
          phone: '+1-555-0100'
        }
      });
      console.log('✅ Admin user created: admin / Admin123!');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Seed Sample Doctors
    const doctorsData = [
      {
        username: 'dr_smith',
        email: 'smith@fmcs.com',
        password: 'Doctor123!',
        role: 'Doctor',
        profile: { firstName: 'John', lastName: 'Smith', phone: '+1-555-0101' },
        doctorProfile: {
          specialization: 'Internal Medicine',
          licenseNumber: 'MD-12345',
          yearsOfExperience: 10
        }
      },
      {
        username: 'dr_jones',
        email: 'jones@fmcs.com',
        password: 'Doctor123!',
        role: 'Doctor',
        profile: { firstName: 'Sarah', lastName: 'Jones', phone: '+1-555-0102' },
        doctorProfile: {
          specialization: 'Pediatrics',
          licenseNumber: 'MD-67890',
          yearsOfExperience: 8
        }
      },
      {
        username: 'dr_wilson',
        email: 'wilson@fmcs.com',
        password: 'Doctor123!',
        role: 'Doctor',
        profile: { firstName: 'Michael', lastName: 'Wilson', phone: '+1-555-0103' },
        doctorProfile: {
          specialization: 'Cardiology',
          licenseNumber: 'MD-11111',
          yearsOfExperience: 15
        }
      }
    ];

    for (const docData of doctorsData) {
      const exists = await User.findOne({ username: docData.username });
      if (!exists) {
        const user = await User.create(docData);
        await Doctor.create({
          userId: user._id,
          ...docData.doctorProfile,
          schedule: {
            monday: { start: '09:00', end: '17:00' },
            tuesday: { start: '09:00', end: '17:00' },
            wednesday: { start: '09:00', end: '17:00' },
            thursday: { start: '09:00', end: '17:00' },
            friday: { start: '09:00', end: '15:00' }
          }
        });
        console.log(`✅ Doctor created: ${docData.username}`);
      }
    }

    // Seed Lab Technician
    const labTechExists = await User.findOne({ role: 'LabTech' });
    if (!labTechExists) {
      const labTech = await User.create({
        username: 'lab_tech',
        email: 'labtech@fmcs.com',
        password: 'LabTech123!',
        role: 'LabTech',
        profile: {
          firstName: 'Emily',
          lastName: 'Brown',
          phone: '+1-555-0104'
        }
      });
      console.log('✅ Lab Technician created: lab_tech / LabTech123!');
    }

    // Seed Receptionist
    const receptionistExists = await User.findOne({ role: 'Receptionist' });
    if (!receptionistExists) {
      await User.create({
        username: 'receptionist',
        email: 'receptionist@fmcs.com',
        password: 'Recept123!',
        role: 'Receptionist',
        profile: {
          firstName: 'Lisa',
          lastName: 'Davis',
          phone: '+1-555-0105'
        }
      });
      console.log('✅ Receptionist created: receptionist / Recept123!');
    }

    // Seed Sample Patients
    const patientsData = [
      {
        mrn: 'MRN-2024-0001',
        firstName: 'James',
        lastName: 'Johnson',
        dateOfBirth: new Date('1985-03-15'),
        gender: 'Male',
        contactPhone: '+1-555-1001',
        email: 'james.j@email.com',
        address: {
          street: '123 Main St',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
          country: 'USA'
        },
        nextOfKin: {
          name: 'Mary Johnson',
          relationship: 'Spouse',
          phone: '+1-555-1002'
        },
        bloodGroup: 'O+',
        allergies: ['Penicillin'],
        chronicConditions: ['Hypertension']
      },
      {
        mrn: 'MRN-2024-0002',
        firstName: 'Maria',
        lastName: 'Garcia',
        dateOfBirth: new Date('1990-07-22'),
        gender: 'Female',
        contactPhone: '+1-555-2001',
        email: 'maria.g@email.com',
        address: {
          street: '456 Oak Ave',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62702',
          country: 'USA'
        },
        nextOfKin: {
          name: 'Carlos Garcia',
          relationship: 'Spouse',
          phone: '+1-555-2002'
        },
        bloodGroup: 'A+',
        allergies: [],
        chronicConditions: ['Type 2 Diabetes']
      },
      {
        mrn: 'MRN-2024-0003',
        firstName: 'Robert',
        lastName: 'Williams',
        dateOfBirth: new Date('1978-11-30'),
        gender: 'Male',
        contactPhone: '+1-555-3001',
        email: 'robert.w@email.com',
        address: {
          street: '789 Pine Rd',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62703',
          country: 'USA'
        },
        nextOfKin: {
          name: 'Susan Williams',
          relationship: 'Spouse',
          phone: '+1-555-3002'
        },
        bloodGroup: 'B+',
        allergies: ['Aspirin', 'Shellfish'],
        chronicConditions: ['Asthma']
      }
    ];

    for (const patientData of patientsData) {
      const exists = await Patient.findOne({ mrn: patientData.mrn });
      if (!exists) {
        await Patient.create(patientData);
        console.log(`✅ Patient created: ${patientData.mrn}`);
      }
    }

    // Seed Lab Test Catalog
    const labTestsCount = await LabTestCatalog.countDocuments();
    if (labTestsCount === 0) {
      await LabTestCatalog.insertMany(labCatalogData.lab_tests);
      console.log(`✅ Lab Test Catalog seeded with ${labCatalogData.lab_tests.length} tests`);
    } else {
      console.log('ℹ️  Lab Test Catalog already populated');
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Default Login Credentials:');
    console.log('   Admin: admin / Admin123!');
    console.log('   Doctor: dr_smith / Doctor123!');
    console.log('   Lab Tech: lab_tech / LabTech123!');
    console.log('   Receptionist: receptionist / Recept123!');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n📴 Database connection closed');
    process.exit(0);
  }
}

seedDatabase();
