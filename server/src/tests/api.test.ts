import request from 'supertest';
import app from '../app';
import { calculateFootprint } from '../controllers/apiControllers';
import { Database } from '../models/db';

const db = Database.getInstance();

beforeEach(async () => {
  // Clear the database before each test to ensure test independence
  await db.reset();
});

describe('🌱 Carbon Footprint Calculation Math', () => {
  test('should accurately calculate total footprint and score for low-emissions persona', () => {
    const lowEmissionsInputs = {
      carMileage: 0,
      fuelType: 'electric' as const,
      publicTransitHours: 0,
      flightsPerYear: 0,
      electricityKwh: 100, // low electricity
      heatingSource: 'none' as const, // no combustion heating
      householdSize: 4, // shared utilities
      waterGallonsDaily: 30, // low water
      dietType: 'vegan' as const, // very low food CO2
      wasteBagsWeekly: 1, // low waste
      recyclingPercent: 90 // high recycling
    };

    const result = calculateFootprint(lowEmissionsInputs);

    expect(result.total).toBeLessThan(3000); // Should be very low
    expect(result.score).toBeGreaterThanOrEqual(90); // Should yield high score
    expect(result.transport).toBe(0); // Zero mileage/flights/transit
  });

  test('should calculate high footprint and low score for high-emissions persona', () => {
    const highEmissionsInputs = {
      carMileage: 25000,
      fuelType: 'petrol' as const,
      publicTransitHours: 10,
      flightsPerYear: 8,
      electricityKwh: 1200,
      heatingSource: 'oil' as const,
      householdSize: 1, // single occupant absorbs all utility emissions
      waterGallonsDaily: 180,
      dietType: 'heavy-meat' as const,
      wasteBagsWeekly: 8,
      recyclingPercent: 0 // no recycling
    };

    const result = calculateFootprint(highEmissionsInputs);

    expect(result.total).toBeGreaterThan(15000); // Should be very high
    expect(result.score).toBe(10); // Should hit floor score limit
  });
});

describe('⚡ REST API Endpoints & Request Validations', () => {
  // 1. Post Footprints
  test('POST /api/footprints should create and save carbon calculation', async () => {
    const payload = {
      carMileage: 5000,
      fuelType: 'hybrid',
      publicTransitHours: 5,
      flightsPerYear: 1,
      electricityKwh: 400,
      heatingSource: 'gas',
      householdSize: 2,
      waterGallonsDaily: 70,
      dietType: 'average-meat',
      wasteBagsWeekly: 3,
      recyclingPercent: 40
    };

    const response = await request(app)
      .post('/api/footprints')
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('total');
    expect(response.body.inputs.carMileage).toBe(5000);
  });

  test('POST /api/footprints should fail on invalid request payload parameters', async () => {
    const badPayload = {
      carMileage: -10, // negative mileage (invalid)
      fuelType: 'rocketship', // invalid engine type
      publicTransitHours: 5,
      flightsPerYear: 1
    };

    const response = await request(app)
      .post('/api/footprints')
      .send(badPayload);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation Error');
  });

  // 2. Fetch actions
  test('GET /api/actions should return default recommender checklist items', async () => {
    const response = await request(app).get('/api/actions');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('co2Reduction');
  });

  // 3. Logger & Streaks
  test('POST /api/logs and GET /api/logs/streaks should track habits and badges', async () => {
    const logPayload = {
      date: new Date().toISOString().split('T')[0],
      transportDistance: 10,
      publicTransitTime: 1,
      isVegetarian: true,
      waterSaved: 15,
      wasteRecycled: true
    };

    const logRes = await request(app)
      .post('/api/logs')
      .send(logPayload);

    expect(logRes.status).toBe(201);
    expect(logRes.body).toHaveProperty('co2Saved');

    const streakRes = await request(app).get('/api/logs/streaks');
    expect(streakRes.status).toBe(200);
    expect(streakRes.body.currentStreak).toBe(1);
    expect(streakRes.body.badges.length).toBe(1); // Unlocks 'First Action' badge
    expect(streakRes.body.badges[0].id).toBe('first-step');
  });
});
