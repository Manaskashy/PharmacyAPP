const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './config.env' });

// Import models
const User = require('./models/User');
const Medicine = require('./models/Medicine');
const Doctor = require('./models/Doctor');

// Sample data
const sampleUsers = [
  {
    username: 'admin',
    email: 'admin@pharmacy.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    phone: '+1234567890',
    dateOfBirth: '1980-01-01',
    role: 'admin',
    address: {
      street: '123 Admin St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    }
  },
  {
    username: 'pharmacist',
    email: 'pharmacist@pharmacy.com',
    password: 'pharma123',
    firstName: 'John',
    lastName: 'Pharmacist',
    phone: '+1234567891',
    dateOfBirth: '1985-05-15',
    role: 'pharmacist',
    address: {
      street: '456 Pharma St',
      city: 'New York',
      state: 'NY',
      zipCode: '10002',
      country: 'USA'
    }
  },
  {
    username: 'doctor_smith',
    email: 'dr.smith@pharmacy.com',
    password: 'doctor123',
    firstName: 'Dr. Sarah',
    lastName: 'Smith',
    phone: '+1234567892',
    dateOfBirth: '1975-03-20',
    role: 'doctor',
    address: {
      street: '789 Medical St',
      city: 'New York',
      state: 'NY',
      zipCode: '10003',
      country: 'USA'
    }
  },
  {
    username: 'patient_jane',
    email: 'jane@example.com',
    password: 'patient123',
    firstName: 'Jane',
    lastName: 'Doe',
    phone: '+1234567893',
    dateOfBirth: '1990-07-10',
    role: 'patient',
    address: {
      street: '321 Patient St',
      city: 'New York',
      state: 'NY',
      zipCode: '10004',
      country: 'USA'
    }
  }
];

const sampleMedicines = [
  {
    name: 'Paracetamol',
    genericName: 'Acetaminophen',
    brandName: 'Tylenol',
    description: 'Pain reliever and fever reducer. Used to treat headaches, muscle aches, arthritis, backache, toothaches, colds, and fevers.',
    category: 'painkillers',
    dosageForm: 'tablet',
    strength: '500mg',
    manufacturer: 'Johnson & Johnson',
    price: 5.99,
    stockQuantity: 150,
    prescriptionRequired: false,
    sideEffects: ['Nausea', 'Stomach upset', 'Liver problems in high doses'],
    contraindications: ['Liver disease', 'Alcohol abuse'],
    interactions: ['Alcohol', 'Blood thinners'],
    expiryDate: '2026-12-31',
    tags: ['fever', 'pain', 'headache', 'otc']
  },
  {
    name: 'Ibuprofen',
    genericName: 'Ibuprofen',
    brandName: 'Advil',
    description: 'Nonsteroidal anti-inflammatory drug (NSAID) used to reduce fever and treat pain or inflammation.',
    category: 'painkillers',
    dosageForm: 'tablet',
    strength: '400mg',
    manufacturer: 'Pfizer',
    price: 7.99,
    stockQuantity: 120,
    prescriptionRequired: false,
    sideEffects: ['Stomach upset', 'Heartburn', 'Dizziness'],
    contraindications: ['Stomach ulcers', 'Kidney disease'],
    interactions: ['Blood pressure medications', 'Diuretics'],
    expiryDate: '2026-10-15',
    tags: ['inflammation', 'pain', 'fever', 'otc']
  },
  {
    name: 'Amoxicillin',
    genericName: 'Amoxicillin',
    brandName: 'Amoxil',
    description: 'Antibiotic used to treat bacterial infections such as bronchitis, pneumonia, and infections of the ear, nose, throat, skin, or urinary tract.',
    category: 'antibiotics',
    dosageForm: 'capsule',
    strength: '500mg',
    manufacturer: 'GlaxoSmithKline',
    price: 25.99,
    stockQuantity: 80,
    prescriptionRequired: true,
    sideEffects: ['Diarrhea', 'Nausea', 'Rash'],
    contraindications: ['Penicillin allergy'],
    interactions: ['Birth control pills', 'Blood thinners'],
    expiryDate: '2025-06-30',
    tags: ['infection', 'bacterial', 'prescription']
  },
  {
    name: 'Vitamin D3',
    genericName: 'Cholecalciferol',
    brandName: 'Nature Made',
    description: 'Vitamin D supplement that helps the body absorb calcium and maintain strong bones.',
    category: 'vitamins',
    dosageForm: 'tablet',
    strength: '1000 IU',
    manufacturer: 'Nature Made',
    price: 12.99,
    stockQuantity: 200,
    prescriptionRequired: false,
    sideEffects: ['Nausea', 'Constipation'],
    contraindications: ['High calcium levels'],
    interactions: ['Calcium supplements', 'Thiazide diuretics'],
    expiryDate: '2027-03-15',
    tags: ['vitamin', 'bones', 'calcium', 'supplement']
  },
  {
    name: 'Omeprazole',
    genericName: 'Omeprazole',
    brandName: 'Prilosec',
    description: 'Proton pump inhibitor that decreases stomach acid production, used to treat acid reflux and stomach ulcers.',
    category: 'gastrointestinal',
    dosageForm: 'capsule',
    strength: '20mg',
    manufacturer: 'AstraZeneca',
    price: 18.99,
    stockQuantity: 95,
    prescriptionRequired: true,
    sideEffects: ['Headache', 'Diarrhea', 'Stomach pain'],
    contraindications: ['Liver disease'],
    interactions: ['Iron supplements', 'Vitamin B12'],
    expiryDate: '2026-08-20',
    tags: ['acid reflux', 'ulcer', 'heartburn', 'prescription']
  },
  {
    name: 'Metformin',
    genericName: 'Metformin',
    brandName: 'Glucophage',
    description: 'Oral diabetes medicine that helps control blood sugar levels in people with type 2 diabetes.',
    category: 'diabetes',
    dosageForm: 'tablet',
    strength: '500mg',
    manufacturer: 'Merck',
    price: 22.99,
    stockQuantity: 75,
    prescriptionRequired: true,
    sideEffects: ['Nausea', 'Diarrhea', 'Stomach upset'],
    contraindications: ['Kidney disease', 'Heart failure'],
    interactions: ['Alcohol', 'Insulin'],
    expiryDate: '2026-05-10',
    tags: ['diabetes', 'blood sugar', 'prescription']
  },
  {
    name: 'Cetirizine',
    genericName: 'Cetirizine',
    brandName: 'Zyrtec',
    description: 'Antihistamine used to relieve allergy symptoms such as watery eyes, runny nose, itching eyes/nose, and sneezing.',
    category: 'respiratory',
    dosageForm: 'tablet',
    strength: '10mg',
    manufacturer: 'Johnson & Johnson',
    price: 8.99,
    stockQuantity: 180,
    prescriptionRequired: false,
    sideEffects: ['Drowsiness', 'Dry mouth', 'Headache'],
    contraindications: ['Kidney disease'],
    interactions: ['Alcohol', 'Sedatives'],
    expiryDate: '2026-11-30',
    tags: ['allergy', 'antihistamine', 'otc']
  },
  {
    name: 'Loratadine',
    genericName: 'Loratadine',
    brandName: 'Claritin',
    description: 'Non-drowsy antihistamine that provides relief from seasonal allergy symptoms.',
    category: 'respiratory',
    dosageForm: 'tablet',
    strength: '10mg',
    manufacturer: 'Bayer',
    price: 9.99,
    stockQuantity: 160,
    prescriptionRequired: false,
    sideEffects: ['Headache', 'Dry mouth', 'Fatigue'],
    contraindications: ['Liver disease'],
    interactions: ['Ketoconazole', 'Erythromycin'],
    expiryDate: '2026-09-25',
    tags: ['allergy', 'non-drowsy', 'otc']
  }
];

const sampleDoctors = [
  {
    specialization: 'cardiology',
    licenseNumber: 'MD123456',
    experience: 15,
    consultationFee: 200.00,
    education: [
      {
        degree: 'MBBS',
        institution: 'Harvard Medical School',
        year: 2005
      },
      {
        degree: 'MD Cardiology',
        institution: 'Johns Hopkins University',
        year: 2010
      }
    ],
    certifications: [
      {
        name: 'Board Certified Cardiologist',
        issuingAuthority: 'American Board of Internal Medicine',
        year: 2011
      }
    ],
    availability: [
      {
        day: 'monday',
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true
      },
      {
        day: 'tuesday',
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true
      },
      {
        day: 'wednesday',
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true
      }
    ],
    languages: ['English', 'Spanish'],
    bio: 'Experienced cardiologist with 15+ years of practice specializing in interventional cardiology and heart failure management.',
    consultationTypes: ['video', 'chat', 'in_person'],
    specialties: ['Interventional Cardiology', 'Heart Failure', 'Preventive Cardiology'],
    isVerified: true
  },
  {
    specialization: 'dermatology',
    licenseNumber: 'MD789012',
    experience: 12,
    consultationFee: 150.00,
    education: [
      {
        degree: 'MBBS',
        institution: 'Stanford Medical School',
        year: 2008
      },
      {
        degree: 'MD Dermatology',
        institution: 'UCLA Medical Center',
        year: 2013
      }
    ],
    certifications: [
      {
        name: 'Board Certified Dermatologist',
        issuingAuthority: 'American Board of Dermatology',
        year: 2014
      }
    ],
    availability: [
      {
        day: 'monday',
        startTime: '10:00',
        endTime: '18:00',
        isAvailable: true
      },
      {
        day: 'thursday',
        startTime: '10:00',
        endTime: '18:00',
        isAvailable: true
      },
      {
        day: 'friday',
        startTime: '10:00',
        endTime: '18:00',
        isAvailable: true
      }
    ],
    languages: ['English', 'French'],
    bio: 'Board-certified dermatologist with expertise in skin cancer detection, cosmetic dermatology, and general dermatological conditions.',
    consultationTypes: ['video', 'in_person'],
    specialties: ['Skin Cancer Detection', 'Cosmetic Dermatology', 'Acne Treatment'],
    isVerified: true
  },
  {
    specialization: 'pediatrics',
    licenseNumber: 'MD345678',
    experience: 8,
    consultationFee: 120.00,
    education: [
      {
        degree: 'MBBS',
        institution: 'Yale Medical School',
        year: 2012
      },
      {
        degree: 'MD Pediatrics',
        institution: 'Boston Children\'s Hospital',
        year: 2016
      }
    ],
    certifications: [
      {
        name: 'Board Certified Pediatrician',
        issuingAuthority: 'American Board of Pediatrics',
        year: 2017
      }
    ],
    availability: [
      {
        day: 'tuesday',
        startTime: '08:00',
        endTime: '16:00',
        isAvailable: true
      },
      {
        day: 'wednesday',
        startTime: '08:00',
        endTime: '16:00',
        isAvailable: true
      },
      {
        day: 'saturday',
        startTime: '09:00',
        endTime: '14:00',
        isAvailable: true
      }
    ],
    languages: ['English', 'Spanish'],
    bio: 'Caring pediatrician with 8+ years of experience in child healthcare, specializing in newborn care, vaccinations, and childhood illnesses.',
    consultationTypes: ['video', 'chat', 'in_person'],
    specialties: ['Newborn Care', 'Vaccinations', 'Childhood Illnesses'],
    isVerified: true
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Medicine.deleteMany({});
    await Doctor.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`👤 Created user: ${user.username}`);
    }

    // Create medicines
    for (const medicineData of sampleMedicines) {
      const medicine = new Medicine(medicineData);
      await medicine.save();
      console.log(`💊 Created medicine: ${medicine.name}`);
    }

    // Create doctors (link to existing users)
    const doctorUser = createdUsers.find(user => user.role === 'doctor');
    if (doctorUser) {
      for (const doctorData of sampleDoctors) {
        const doctor = new Doctor({
          ...doctorData,
          user: doctorUser._id
        });
        await doctor.save();
        console.log(`👨‍⚕️ Created doctor: ${doctorUser.firstName} ${doctorUser.lastName} - ${doctor.specialization}`);
      }
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`📊 Created ${createdUsers.length} users`);
    console.log(`💊 Created ${sampleMedicines.length} medicines`);
    console.log(`👨‍⚕️ Created ${sampleDoctors.length} doctors`);

    // Display sample login credentials
    console.log('\n🔑 Sample Login Credentials:');
    console.log('Admin: admin / admin123');
    console.log('Pharmacist: pharmacist / pharma123');
    console.log('Doctor: doctor_smith / doctor123');
    console.log('Patient: patient_jane / patient123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seeding function
seedDatabase();

