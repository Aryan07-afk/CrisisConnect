const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const HelpRequest = require('./models/HelpRequest');
const VictimRequest = require('./models/VictimRequest');

dotenv.config();

const numVolunteers = 20;
const numHelpRequests = 50;
const numVictimRequests = 50;

const locations = [
  { lat: 19.0760, lng: 72.8777, name: 'Mumbai, Maharashtra' },
  { lat: 28.7041, lng: 77.1025, name: 'Delhi' },
  { lat: 13.0827, lng: 80.2707, name: 'Chennai, Tamil Nadu' },
  { lat: 22.5726, lng: 88.3639, name: 'Kolkata, West Bengal' },
  { lat: 12.9716, lng: 77.5946, name: 'Bangalore, Karnataka' },
  { lat: 17.3850, lng: 78.4867, name: 'Hyderabad, Telangana' },
  { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad, Gujarat' },
  { lat: 26.9124, lng: 75.7873, name: 'Jaipur, Rajasthan' },
  { lat: 26.8467, lng: 80.9462, name: 'Lucknow, UP' },
  { lat: 25.5941, lng: 85.1376, name: 'Patna, Bihar' },
  { lat: 15.2993, lng: 74.1240, name: 'Goa' },
  { lat: 31.1048, lng: 77.1665, name: 'Shimla, HP' },
  { lat: 21.1458, lng: 79.0882, name: 'Nagpur, Maharashtra' },
  { lat: 10.8505, lng: 76.2711, name: 'Kerala' },
  { lat: 26.1445, lng: 91.7362, name: 'Guwahati, Assam' }
];

const requestTypes = ['food', 'water', 'shelter', 'medical', 'rescue', 'clothing', 'other'];
const priorities = ['low', 'medium', 'high', 'critical'];
const statuses = ['pending', 'assigned', 'in_progress', 'resolved'];
const victimStatuses = ['submitted', 'reviewing', 'linked', 'resolved', 'closed'];

const getRandomArrayElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate random lat/lng around India
const getRandomLocation = () => {
  const baseLoc = getRandomArrayElement(locations);
  // Add some random scatter
  const latOffset = (Math.random() - 0.5) * 4; 
  const lngOffset = (Math.random() - 0.5) * 4;
  return {
    address: baseLoc.name,
    area: baseLoc.name.split(',')[0],
    coordinates: {
      lat: baseLoc.lat + latOffset,
      lng: baseLoc.lng + lngOffset
    }
  };
};

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected for seeding...');

    // Clear existing HelpRequests and VictimRequests
    await HelpRequest.deleteMany({});
    await VictimRequest.deleteMany({});
    console.log('Cleared existing requests.');

    // We keep admins but delete other volunteers/victims to clean up? 
    // Or just create new ones. Let's just create new volunteers and victims.
    // It's safer to not delete users so we don't accidentally delete the admin.
    
    const volunteers = [];
    for (let i = 0; i < numVolunteers; i++) {
      const vol = new User({
        name: `Volunteer ${i+1}`,
        email: `volunteer${i+1}_${Date.now()}@test.com`,
        password: 'password123',
        role: 'volunteer',
        skills: [getRandomArrayElement(['medical', 'rescue', 'logistics', 'communication', 'general'])],
        isAvailable: Math.random() > 0.3
      });
      await vol.save();
      volunteers.push(vol);
    }
    console.log(`Created ${numVolunteers} volunteers.`);

    const victims = [];
    for (let i = 0; i < 10; i++) {
      const vic = new User({
        name: `Victim ${i+1}`,
        email: `victim${i+1}_${Date.now()}@test.com`,
        password: 'password123',
        role: 'victim',
        address: 'Test Address'
      });
      await vic.save();
      victims.push(vic);
    }
    console.log(`Created 10 victim users.`);

    for (let i = 0; i < numHelpRequests; i++) {
      const loc = getRandomLocation();
      const status = getRandomArrayElement(statuses);
      const req = new HelpRequest({
        title: `Emergency ${getRandomArrayElement(requestTypes)} needed at ${loc.area}`,
        description: `This is a dummy help request for testing purposes.`,
        requestType: getRandomArrayElement(requestTypes),
        priority: getRandomArrayElement(priorities),
        status: status,
        location: loc,
        affectedCount: getRandomInt(1, 100),
        raisedBy: getRandomArrayElement(volunteers)._id,
        assignedTo: status === 'pending' ? null : getRandomArrayElement(volunteers)._id,
      });
      await req.save();
    }
    console.log(`Created ${numHelpRequests} help requests.`);

    for (let i = 0; i < numVictimRequests; i++) {
      const loc = getRandomLocation();
      const req = new VictimRequest({
        victim: getRandomArrayElement(victims)._id,
        needType: getRandomArrayElement(requestTypes),
        description: `Dummy victim request.`,
        urgency: getRandomArrayElement(['critical', 'high', 'medium', 'low']),
        peopleCount: getRandomInt(1, 10),
        location: loc,
        status: getRandomArrayElement(victimStatuses),
      });
      await req.save();
    }
    console.log(`Created ${numVictimRequests} victim requests.`);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
