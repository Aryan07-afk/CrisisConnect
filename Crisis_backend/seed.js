const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const HelpRequest = require('./models/HelpRequest');
const VictimRequest = require('./models/VictimRequest');
const AuditLog = require('./models/AuditLog');

dotenv.config();

const numVolunteers = 24;
const numHelpRequests = 50;
const numVictimRequests = 40;

// Seed accounts (fixed emails so re-running never duplicates)
const ADMIN = {
  name: 'Super Admin',
  email: 'admin@crisisconnect.com',
  password: 'Admin@123',
  role: 'admin',
  adminLevel: 1,
};

const COORDINATORS = [
  { name: 'Priya Coordinator', email: 'coordinator@crisisconnect.com', password: 'Coord@123', phone: '+91 98200 11111' },
];

const requestTypes = ['food', 'water', 'shelter', 'medical', 'rescue', 'clothing', 'other'];
const priorities = ['low', 'medium', 'high', 'critical'];
const statuses = ['pending', 'assigned', 'in_progress', 'resolved'];
const victimStatuses = ['submitted', 'reviewing', 'linked', 'resolved', 'closed'];

const locations = [
  { lat: 19.0760, lng: 72.8777, name: 'Mumbai, Maharashtra', area: 'Mumbai', district: 'Mumbai', state: 'Maharashtra' },
  { lat: 28.7041, lng: 77.1025, name: 'Delhi', area: 'Delhi', district: 'New Delhi', state: 'Delhi' },
  { lat: 13.0827, lng: 80.2707, name: 'Chennai, Tamil Nadu', area: 'Chennai', district: 'Chennai', state: 'Tamil Nadu' },
  { lat: 22.5726, lng: 88.3639, name: 'Kolkata, West Bengal', area: 'Kolkata', district: 'Kolkata', state: 'West Bengal' },
  { lat: 12.9716, lng: 77.5946, name: 'Bangalore, Karnataka', area: 'Bangalore', district: 'Bengaluru Urban', state: 'Karnataka' },
  { lat: 17.3850, lng: 78.4867, name: 'Hyderabad, Telangana', area: 'Hyderabad', district: 'Hyderabad', state: 'Telangana' },
  { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad, Gujarat', area: 'Ahmedabad', district: 'Ahmedabad', state: 'Gujarat' },
  { lat: 26.9124, lng: 75.7873, name: 'Jaipur, Rajasthan', area: 'Jaipur', district: 'Jaipur', state: 'Rajasthan' },
  { lat: 26.8467, lng: 80.9462, name: 'Lucknow, UP', area: 'Lucknow', district: 'Lucknow', state: 'Uttar Pradesh' },
  { lat: 25.5941, lng: 85.1376, name: 'Patna, Bihar', area: 'Patna', district: 'Patna', state: 'Bihar' },
  { lat: 15.2993, lng: 74.1240, name: 'Goa', area: 'Panaji', district: 'North Goa', state: 'Goa' },
  { lat: 31.1048, lng: 77.1665, name: 'Shimla, HP', area: 'Shimla', district: 'Shimla', state: 'Himachal Pradesh' },
  { lat: 21.1458, lng: 79.0882, name: 'Nagpur, Maharashtra', area: 'Nagpur', district: 'Nagpur', state: 'Maharashtra' },
  { lat: 10.8505, lng: 76.2711, name: 'Kerala', area: 'Thiruvananthapuram', district: 'Thiruvananthapuram', state: 'Kerala' },
  { lat: 26.1445, lng: 91.7365, name: 'Guwahati, Assam', area: 'Guwahati', district: 'Kamrup', state: 'Assam' },
];

const firstNames = ['Aarav','Diya','Rohan','Ananya','Kabir','Ishita','Vivaan','Meera','Arjun','Sanya','Dev','Riya','Aditya','Nisha','Karan','Tara','Nikhil','Pooja','Sameer','Kavya','Rahul','Sneha','Amit','Divya'];
const lastNames = ['Sharma','Patel','Singh','Kumar','Das','Reddy','Iyer','Gupta','Mehta','Joshi'];

const descriptions = {
  food: 'Family of five has not eaten in two days. Rations exhausted due to flooding.',
  water: 'Clean drinking water supply contaminated. Urgent need for bottled water.',
  shelter: 'House collapsed in the storm. Eight people sleeping in the open.',
  medical: 'Elderly diabetic patient out of insulin. Nearest hospital unreachable.',
  rescue: 'Group stranded on rooftop as water levels continue rising rapidly.',
  clothing: 'All belongings lost. Need blankets and warm clothing for children.',
  other: 'Requesting assistance with evacuation and temporary transport.',
};

const getRandomArrayElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (min + Math.random() * (max - min + 1)));

// Scatter around a base city so proximity matching has meaningful clusters
const getRandomLocation = () => {
  const baseLoc = getRandomArrayElement(locations);
  const latOffset = (Math.random() - 0.5) * 0.25;
  const lngOffset = (Math.random() - 0.5) * 0.25;
  return {
    address: `${getRandomInt(1, 200)} ${baseLoc.area} Main Road, ${baseLoc.name}`,
    area: baseLoc.area,
    coordinates: {
      lat: +(baseLoc.lat + latOffset).toFixed(5),
      lng: +(baseLoc.lng + lngOffset).toFixed(5),
    },
  };
};

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // ── Clean slate (keeps nothing — deterministic demo data) ──
    await Promise.all([
      User.deleteMany({}),
      HelpRequest.deleteMany({}),
      VictimRequest.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);
    console.log('Cleared existing data.');

    // ── Admin + coordinators ──
    const admin = await User.create(ADMIN);
    console.log(`Created admin → ${ADMIN.email} / ${ADMIN.password}`);

    const coordinators = [];
    for (const c of COORDINATORS) {
      coordinators.push(await User.create({ ...c, role: 'coordinator' }));
      console.log(`Created coordinator → ${c.email} / ${c.password}`);
    }

    // ── Volunteers: coordinates clustered near cities + skills that match
    //    the request types generated below, so best-match scoring demos well ──
    const volunteers = [];
    for (let i = 0; i < numVolunteers; i++) {
      const baseLoc = locations[i % locations.length];
      const skill = requestTypes[i % requestTypes.length];
      const first = firstNames[i % firstNames.length];
      const last = lastNames[(i * 3) % lastNames.length];
      const vol = await User.create({
        name: `${first} ${last}`,
        email: `volunteer${i + 1}@test.com`,
        password: 'password123',
        role: 'volunteer',
        skills: [skill, getRandomArrayElement(requestTypes)],
        isAvailable: Math.random() > 0.25,
        location: baseLoc.area,
        coordinates: {
          lat: +(baseLoc.lat + (Math.random() - 0.5) * 0.3).toFixed(5),
          lng: +(baseLoc.lng + (Math.random() - 0.5) * 0.3).toFixed(5),
        },
        phone: `+91 9${getRandomInt(100000000, 999999999)}`,
      });
      volunteers.push(vol);
    }
    console.log(`Created ${numVolunteers} volunteers (password: password123).`);

    // ── Victims ──
    const victims = [];
    for (let i = 0; i < 12; i++) {
      const loc = locations[i % locations.length];
      const first = firstNames[(i * 5) % firstNames.length];
      const last = lastNames[(i * 7) % lastNames.length];
      victims.push(await User.create({
        name: `${first} ${last}`,
        email: `victim${i + 1}@test.com`,
        password: 'password123',
        role: 'victim',
        address: `${getRandomInt(1, 150)} Relief Camp Road, ${loc.area}`,
        district: loc.district,
        state: loc.state,
        phone: `+91 8${getRandomInt(100000000, 999999999)}`,
      }));
    }
    console.log('Created 12 victim users (password: password123).');

    // ── Help requests ──
    for (let i = 0; i < numHelpRequests; i++) {
      const loc = getRandomLocation();
      const status = getRandomArrayElement(statuses);
      const requestType = getRandomArrayElement(requestTypes);
      await HelpRequest.create({
        title: `Emergency ${requestType} needed at ${loc.area}`,
        description: descriptions[requestType],
        requestType,
        priority: getRandomArrayElement(priorities),
        status,
        location: loc,
        affectedCount: getRandomInt(1, 60),
        raisedBy: getRandomArrayElement(coordinators)._id,
        assignedTo: status === 'pending' ? null : getRandomArrayElement(volunteers)._id,
      });
    }
    console.log(`Created ${numHelpRequests} help requests.`);

    // ── Victim SOS requests ──
    for (let i = 0; i < numVictimRequests; i++) {
      const loc = getRandomLocation();
      const needType = getRandomArrayElement(requestTypes);
      await VictimRequest.create({
        victim: getRandomArrayElement(victims)._id,
        needType,
        description: descriptions[needType],
        urgency: getRandomArrayElement(['critical', 'high', 'medium', 'low']),
        peopleCount: getRandomInt(1, 10),
        location: loc,
        status: getRandomArrayElement(victimStatuses),
      });
    }
    console.log(`Created ${numVictimRequests} victim requests.`);

    console.log('\n────────── Demo Accounts ──────────');
    console.log('Admin       → admin@crisisconnect.com / Admin@123');
    console.log('Coordinator → coordinator@crisisconnect.com / Coord@123');
    console.log('Volunteer   → volunteer1@test.com / password123');
    console.log('Victim      → victim1@test.com / password123');
    console.log('────────────────────────────────────\n');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
