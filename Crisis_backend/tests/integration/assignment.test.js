const request = require('supertest');
const app = require('../../server');
const generateToken = require('../../utils/generateToken');
const User = require('../../models/User');
const HelpRequest = require('../../models/HelpRequest');
const Assignment = require('../../models/Assignment');

describe('Assignment Integration Tests', () => {
  let adminToken, coordinatorToken, volunteer, req1, req2;

  beforeEach(async () => {
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
      isActive: true,
    });
    adminToken = generateToken(adminUser._id);

    const coordUser = await User.create({
      name: 'Coord User',
      email: 'coord@example.com',
      password: 'password123',
      role: 'coordinator',
      isActive: true,
    });
    coordinatorToken = generateToken(coordUser._id);

    volunteer = await User.create({
      name: 'Vol User',
      email: 'vol@example.com',
      password: 'password123',
      role: 'volunteer',
      isActive: true,
      isAvailable: true,
    });

    req1 = await HelpRequest.create({
      title: 'Req 1',
      description: 'Desc 1',
      requestType: 'medical',
      location: { address: 'Addr 1' },
      raisedBy: volunteer._id, // Any user
    });

    req2 = await HelpRequest.create({
      title: 'Req 2',
      description: 'Desc 2',
      requestType: 'food',
      location: { address: 'Addr 2' },
      raisedBy: volunteer._id,
    });
  });

  it('[Expected Failure] Double Booking: Coordinator can assign unavailable volunteer', async () => {
    const assign1 = await request(app)
      .post('/api/assignments')
      .set('Authorization', `Bearer ${coordinatorToken}`)
      .send({
        requestId: req1._id.toString(),
        volunteerId: volunteer._id.toString(),
      });
    expect(assign1.statusCode).toBe(201);

    // Second assignment (should fail because volunteer.isAvailable is now false)
    const assign2 = await request(app)
      .post('/api/assignments')
      .set('Authorization', `Bearer ${coordinatorToken}`)
      .send({
        requestId: req2._id.toString(),
        volunteerId: volunteer._id.toString(),
      });

    // It should now fail because volunteer is unavailable (returns 404 not found/inactive based on logic)
    expect(assign2.statusCode).toBe(404);
  });

  it('[Expected Failure] State Corruption: Admin can delete a completed assignment', async () => {
    const assignment = await Assignment.create({
      request: req1._id,
      volunteer: volunteer._id,
      assignedBy: volunteer._id, // Mocked assignedBy
      status: 'completed',
    });
    await HelpRequest.findByIdAndUpdate(req1._id, { status: 'resolved', assignedTo: volunteer._id });
    
    const delRes = await request(app)
      .delete(`/api/assignments/${assignment._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    // Should fail (400) because it's completed
    expect(delRes.statusCode).toBe(400);

    // Verify state is NOT corrupted
    const checkReq = await HelpRequest.findById(req1._id);
    expect(checkReq.status).toBe('resolved');
  });
});
