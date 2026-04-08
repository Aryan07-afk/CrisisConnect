/**
 * Seeder Script — CrisisConnect
 * Usage: node utils/seeder.js
 * Clears and repopulates the DB with demo admin, coordinator, volunteers, requests.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const HelpRequest = require('../models/HelpRequest');
const Assignment = require('../models/Assignment');

const connectDB = require('../config/db');

const seed = async () => {
  await connectDB();

  // Clear existing data
  await User.deleteMany();
  await HelpRequest.deleteMany();
  await Assignment.deleteMany();
  console.log('🗑️  Cleared existing data');

  // ---- Users ----
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@crisisconnect.com',
    password: 'admin123',
    role: 'admin',
    phone: '9000000001',
    organization: 'CrisisConnect HQ',
  });

  const coordinator = await User.create({
    name: 'Aryan Dhoundiyal',
    email: 'aryan@crisisconnect.com',
    password: 'aryan123',
    role: 'coordinator',
    phone: '9000000002',
    organization: 'District Disaster Mgmt',
  });

  const volunteer1 = await User.create({
    name: 'Vaibhav Rawat',
    email: 'vaibhav@crisisconnect.com',
    password: 'vaibhav123',
    role: 'volunteer',
    phone: '9000000003',
    skills: ['medical', 'rescue'],
    location: 'Dehradun',
    isAvailable: true,
  });

  const volunteer2 = await User.create({
    name: 'Harshit Negi',
    email: 'harshit@crisisconnect.com',
    password: 'harshit123',
    role: 'volunteer',
    phone: '9000000004',
    skills: ['logistics', 'general'],
    location: 'Haridwar',
    isAvailable: true,
  });

  const victim1 = await User.create({
    name: 'Ravi Kumar',
    email: 'ravi@victim.com',
    password: 'ravi123',
    role: 'victim',
    phone: '9000000005',
    address: 'Village Khanduri, Near River Bank',
    district: 'Chamoli',
    state: 'Uttarakhand',
  });

  console.log('👤  Users seeded');

  // ── Victim Requests ----
  const VictimRequest = require('../models/VictimRequest');
  await VictimRequest.deleteMany();

  await VictimRequest.create({
    victim: victim1._id,
    needType: 'food',
    description: 'Family of 5 stranded. No food for 2 days. Children are hungry.',
    urgency: 'critical',
    peopleCount: 5,
    location: {
      address: 'Village Khanduri, Near River Bank',
      area: 'Khanduri',
      district: 'Chamoli',
      state: 'Uttarakhand',
      landmark: 'Near the old temple',
    },
    status: 'submitted',
  });

  await VictimRequest.create({
    victim: victim1._id,
    needType: 'medical',
    description: 'Elderly father needs urgent medical help. Has chest pain.',
    urgency: 'critical',
    peopleCount: 1,
    location: {
      address: 'Village Khanduri, House No 12',
      district: 'Chamoli',
      state: 'Uttarakhand',
    },
    status: 'reviewing',
    responseNote: 'A medical volunteer has been alerted and will reach you soon.',
  });

  console.log('🆘  Victim requests seeded');

  // ---- Help Requests ----
  const req1 = await HelpRequest.create({
    title: 'Flood victims need food and water',
    description: 'Approx 50 people stranded near river bank, no food/water for 2 days.',
    requestType: 'food',
    priority: 'critical',
    status: 'pending',
    location: {
      address: 'River Bank, Rishikesh',
      area: 'Rishikesh',
      district: 'Dehradun',
      state: 'Uttarakhand',
    },
    affectedCount: 50,
    raisedBy: volunteer1._id,
  });

  const req2 = await HelpRequest.create({
    title: 'Medical assistance required',
    description: 'Several injured people need first-aid and medicines after landslide.',
    requestType: 'medical',
    priority: 'high',
    status: 'assigned',
    location: {
      address: 'Village Khanduri, Chamoli',
      area: 'Chamoli',
      district: 'Chamoli',
      state: 'Uttarakhand',
    },
    affectedCount: 15,
    raisedBy: volunteer1._id,
    assignedTo: volunteer2._id,
    reviewedBy: coordinator._id,
  });

  const req3 = await HelpRequest.create({
    title: 'Temporary shelter needed',
    description: '20 families have lost their homes due to earthquake. Need tents.',
    requestType: 'shelter',
    priority: 'high',
    status: 'in_progress',
    location: {
      address: 'Block 4, Joshimath',
      area: 'Joshimath',
      district: 'Chamoli',
      state: 'Uttarakhand',
    },
    affectedCount: 80,
    raisedBy: volunteer2._id,
    assignedTo: volunteer1._id,
    reviewedBy: coordinator._id,
  });

  const req4 = await HelpRequest.create({
    title: 'Rescue operation - elderly trapped',
    description: 'Three elderly residents unable to evacuate due to rising water.',
    requestType: 'rescue',
    priority: 'critical',
    status: 'resolved',
    location: {
      address: 'Lane 7, Haridwar',
      area: 'Haridwar',
      district: 'Haridwar',
      state: 'Uttarakhand',
    },
    affectedCount: 3,
    raisedBy: volunteer2._id,
    assignedTo: volunteer1._id,
    reviewedBy: admin._id,
    resolvedAt: new Date(),
  });

  console.log('📋  Help requests seeded');

  // ---- Assignments ----
  await Assignment.create({
    request: req2._id,
    volunteer: volunteer2._id,
    assignedBy: coordinator._id,
    status: 'accepted',
    acceptedAt: new Date(),
  });

  await Assignment.create({
    request: req3._id,
    volunteer: volunteer1._id,
    assignedBy: coordinator._id,
    status: 'in_progress',
    acceptedAt: new Date(),
  });

  await Assignment.create({
    request: req4._id,
    volunteer: volunteer1._id,
    assignedBy: admin._id,
    status: 'completed',
    acceptedAt: new Date(Date.now() - 3600000),
    completedAt: new Date(),
  });

  console.log('🔗  Assignments seeded');
  console.log('\n✅  Seeding complete!\n');
  console.log('Demo credentials:');
  console.log('  Admin      → admin@crisisconnect.com / admin123');
  console.log('  Coordinator→ aryan@crisisconnect.com / aryan123');
  console.log('  Volunteer 1→ vaibhav@crisisconnect.com / vaibhav123');
  console.log('  Volunteer 2→ harshit@crisisconnect.com / harshit123');
  console.log('  Victim     → ravi@victim.com / ravi123');

  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
