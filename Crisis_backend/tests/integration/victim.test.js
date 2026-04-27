const request = require('supertest');
const app = require('../../server');
const generateToken = require('../../utils/generateToken');
const User = require('../../models/User');
const VictimRequest = require('../../models/VictimRequest');

describe('Victim Request Integration Tests', () => {
  let victim, coordinator, victimToken, coordToken;

  beforeEach(async () => {
    victim = await User.create({
      name: 'Victim One',
      email: 'victim@example.com',
      password: 'password123',
      role: 'victim',
    });
    victimToken = generateToken(victim._id);

    coordinator = await User.create({
      name: 'Coordinator One',
      email: 'coord@example.com',
      password: 'password123',
      role: 'coordinator',
    });
    coordToken = generateToken(coordinator._id);
  });

  it('Victim can submit an SOS request', async () => {
    const res = await request(app)
      .post('/api/victim/requests')
      .set('Authorization', `Bearer ${victimToken}`)
      .send({
        needType: 'medical',
        description: 'Need help immediately',
        urgency: 'critical',
        peopleCount: 2,
        location: { address: '123 Main St' }
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.needType).toBe('medical');
    expect(res.body.data.status).toBe('submitted');
  });

  it('Coordinator can fetch all requests sorted by newest first', async () => {
    // Submit three requests with different times
    await VictimRequest.create({
      victim: victim._id,
      needType: 'food',
      description: 'First',
      location: { address: 'A' },
      createdAt: new Date(Date.now() - 20000)
    });
    await VictimRequest.create({
      victim: victim._id,
      needType: 'water',
      description: 'Second',
      location: { address: 'B' },
      createdAt: new Date(Date.now() - 10000)
    });
    await VictimRequest.create({
      victim: victim._id,
      needType: 'rescue',
      description: 'Third (Newest)',
      location: { address: 'C' },
      createdAt: new Date()
    });

    const res = await request(app)
      .get('/api/victim')
      .set('Authorization', `Bearer ${coordToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.docs.length).toBe(3);
    // Newest should be first
    expect(res.body.data.docs[0].description).toBe('Third (Newest)');
  });

  it('Coordinator view supports pagination', async () => {
    // Create 25 requests
    const requests = [];
    for (let i = 1; i <= 25; i++) {
      requests.push({
        victim: victim._id,
        needType: 'other',
        description: `Request ${i}`,
        location: { address: 'Loc' }
      });
    }
    await VictimRequest.insertMany(requests);

    // Fetch first page (limit 20)
    const res1 = await request(app)
      .get('/api/victim?limit=20&page=1')
      .set('Authorization', `Bearer ${coordToken}`);
    
    expect(res1.body.data.docs.length).toBe(20);
    expect(res1.body.data.pagination.totalPages).toBe(2);
    expect(res1.body.data.pagination.hasNextPage).toBe(true);

    // Fetch second page
    const res2 = await request(app)
      .get('/api/victim?limit=20&page=2')
      .set('Authorization', `Bearer ${coordToken}`);
    
    expect(res2.body.data.docs.length).toBe(5);
    expect(res2.body.data.pagination.page).toBe(2);
  });
});
