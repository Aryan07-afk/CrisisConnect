const request = require('supertest');
const app = require('../../server');
const generateToken = require('../../utils/generateToken');
const User = require('../../models/User');
const HelpRequest = require('../../models/HelpRequest');

describe('HelpRequest Integration Tests', () => {
  let victimA, victimB, tokenA, tokenB;

  beforeEach(async () => {
    victimA = await User.create({
      name: 'Victim A',
      email: 'victima@example.com',
      password: 'password123',
      role: 'victim',
    });
    tokenA = generateToken(victimA._id);

    victimB = await User.create({
      name: 'Victim B',
      email: 'victimb@example.com',
      password: 'password123',
      role: 'victim',
    });
    tokenB = generateToken(victimB._id);

    await HelpRequest.create({
      title: 'Need Food',
      description: 'Stuck due to floods',
      requestType: 'food',
      priority: 'high',
      location: { address: 'Downtown' },
      raisedBy: victimB._id,
    });
  });

  it('[Expected Failure] Victim Data Leak: Victim A can fetch Victim B requests', async () => {
    const res = await request(app)
      .get('/api/requests')
      .set('Authorization', `Bearer ${tokenA}`);

    // The system is now secure, this shouldn't return Victim B's request.
    expect(res.statusCode).toBe(200);
    expect(res.body.data.pagination.totalDocs).toBe(0); // Only their own requests (which is 0)
  });

  it('[Expected Failure] Privilege Escalation: Victim A can resolve their own request', async () => {
    const reqRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Need Medical Help',
        description: 'Broken arm',
        requestType: 'medical',
        location: { address: 'Uptown' },
      });
    const requestId = reqRes.body.data._id;

    const updateRes = await request(app)
      .put(`/api/requests/${requestId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        status: 'resolved',
      });

    // The system is secure, this should be ignored (status remains pending) or throw an error.
    // In our code, allowedFields filters it out silently.
    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.data.status).toBe('pending');
  });

  it('[Passes] Standard SOS Submission', async () => {
    const reqRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Need Rescue',
        description: 'Trapped in house',
        requestType: 'rescue',
        location: { address: 'Suburbs' },
        priority: 'critical',
      });

    expect(reqRes.statusCode).toBe(201);
    expect(reqRes.body.data.title).toBe('Need Rescue');
    expect(reqRes.body.data.status).toBe('pending');
  });
});
