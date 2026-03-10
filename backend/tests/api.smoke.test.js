process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "test-access-secret";
process.env.NODE_ENV = "test";

const request = require("supertest");

const mockAdminUser = {
  _id: "507f191e810c19729de860ea",
  name: "API Admin",
  email: "admin_api_test@example.com",
  phone: null,
  role: "admin",
  isActive: true,
  comparePassword: jest.fn(async (password) => password === "AdminPass123!")
};

const mockQueueList = [];
const mockEventsList = [
  {
    _id: "507f191e810c19729de860eb",
    title: "Health Camp",
    organizationType: "Hospital",
    organizationName: "City General Hospital",
    startDate: "2030-05-01",
    endDate: "2030-05-01",
    date: "2030-05-01",
    time: "09:00 - 17:00",
    startTime: "09:00",
    endTime: "17:00",
    location: "Main Block",
    totalTokens: 100
  }
];

const createLeanQuery = (data) => ({
  sort: jest.fn().mockReturnValue({
    limit: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(data)
    }),
    lean: jest.fn().mockResolvedValue(data)
  }),
  lean: jest.fn().mockResolvedValue(data)
});

jest.mock("../models/user", () => ({
  findOne: jest.fn(async (query) => {
    if (
      query?.email === mockAdminUser.email ||
      query?.phone === mockAdminUser.phone
    ) {
      return mockAdminUser;
    }
    return null;
  }),
  findById: jest.fn(async (id) => {
    if (id === mockAdminUser._id) {
      return mockAdminUser;
    }
    return null;
  })
}));

jest.mock("../models/queue", () => ({
  find: jest.fn(() => createLeanQuery(mockQueueList)),
  aggregate: jest.fn(async () => []),
  countDocuments: jest.fn(async () => 0),
  syncIndexes: jest.fn(async () => undefined)
}));

jest.mock("../models/event", () => ({
  find: jest.fn(() => ({
    sort: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockEventsList)
    })
  })),
  findById: jest.fn(async () => mockEventsList[0])
}));

jest.mock("../models/eventHistory", () => ({
  find: jest.fn(() => createLeanQuery([])),
  countDocuments: jest.fn(async () => 0)
}));

jest.mock("../models/queueCounter", () => ({
  findOneAndUpdate: jest.fn(async () => ({ lean: async () => ({ seq: 1 }) }))
}));

jest.mock("../services/emailService", () => ({
  sendQueueRegistrationEmail: jest.fn(async () => ({ success: true }))
}));

jest.mock("../services/mlPredictionService", () => ({
  getPredictionsIfTrained: jest.fn(async () => null)
}));

jest.mock("../services/eventCleanupService", () => ({
  purgeExpiredEvents: jest.fn(async () => ({ deletedEvents: 0, deletedQueues: 0 })),
  isEventExpired: jest.fn(() => false)
}));

jest.mock("../../src/services/mlSafeWrapper", () => ({
  callMLInference: jest.fn(async () => ({ prediction: 12 })),
  getMLHealth: jest.fn(async () => ({ trained: true }))
}));

jest.mock("axios", () => ({
  post: jest.fn(async () => ({ data: { trained: true } })),
  get: jest.fn(async () => ({ data: { trained: true } }))
}));

const { app } = require("../app");

describe("API smoke coverage", () => {
  let adminToken = "";

  beforeAll(async () => {
    const loginRes = await request(app)
      .post("/api/auth/admin/login")
      .send({
        emailOrPhone: mockAdminUser.email,
        password: "AdminPass123!"
      });

    expect(loginRes.status).toBe(200);
    adminToken = loginRes.body.accessToken;
    expect(adminToken).toBeTruthy();
  });

  test("health endpoint responds", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
  });

  test("invalid queue token returns 400 (fixed)", async () => {
    const res = await request(app).get("/api/queue/status/ABC");
    expect(res.status).toBe(400);
  });

  test("public events endpoint responds", async () => {
    const res = await request(app).get("/api/events");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("unauthorized me endpoint is protected", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  test("authorized admin queue list responds", async () => {
    const res = await request(app)
      .get("/api/queue")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("ml train no longer returns 500 (fixed)", async () => {
    const res = await request(app)
      .post("/api/ml/train")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});

    expect([200, 400]).toContain(res.status);
  });

  test("ml predict invalid input returns 400 (TC17)", async () => {
    const res = await request(app)
      .post("/api/ml/predict")
      .send({
        type: "queue-length",
        hour: "invalid-hour"
      });

    expect(res.status).toBe(400);
    expect(String(res.body?.message || "")).toContain("hour");
  });
});
