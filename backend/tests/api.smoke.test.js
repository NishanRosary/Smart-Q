const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const axios = require("axios");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/user");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const BACKEND_DIR = path.join(__dirname, "..");
const ML_DIR = path.join(BACKEND_DIR, "ml");
const BASE_URL = "http://localhost:5050";
const ML_HEALTH_URL = "http://localhost:5001/health";

let backendProc = null;
let mlProc = null;
let adminToken = null;
let backendLogs = "";

jest.setTimeout(120000);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitFor = async (fn, timeoutMs = 30000, intervalMs = 500) => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      if (await fn()) return true;
    } catch (_) {
      // ignore transient startup errors
    }
    await sleep(intervalMs);
  }
  return false;
};

const request = async (method, endpoint, body, token) => {
  const res = await axios({
    method,
    url: `${BASE_URL}${endpoint}`,
    data: body,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    validateStatus: () => true
  });
  return {
    status: res.status,
    text: JSON.stringify(res.data || ""),
    json: res.data
  };
};

const isMlHealthy = async () => {
  const res = await axios.get(ML_HEALTH_URL, { validateStatus: () => true });
  return res.status === 200;
};

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const adminEmail = "admin_api_test@example.com";
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = new User({
      name: "API Admin",
      email: adminEmail,
      password: "AdminPass123!",
      role: "admin",
      isActive: true
    });
  } else {
    admin.role = "admin";
    admin.isActive = true;
    admin.password = "AdminPass123!";
  }
  await admin.save();
  await mongoose.disconnect();

  if (!(await isMlHealthy())) {
    const pyExe = path.join(ML_DIR, "venv", "Scripts", "python.exe");
    if (fs.existsSync(pyExe)) {
      mlProc = spawn(pyExe, ["ml_service.py", "5001"], {
        cwd: ML_DIR,
        stdio: "pipe",
        shell: false
      });
      const mlStarted = await waitFor(isMlHealthy, 30000, 500);
      if (!mlStarted) {
        throw new Error("ML service failed to start on port 5001");
      }
    }
  }

  backendProc = spawn("node", ["server.js"], {
    cwd: BACKEND_DIR,
    env: { ...process.env, PORT: "5050" },
    stdio: "pipe",
    shell: false
  });

  backendProc.stdout?.on("data", (chunk) => {
    backendLogs += chunk.toString();
  });
  backendProc.stderr?.on("data", (chunk) => {
    backendLogs += chunk.toString();
  });

  const backendStarted = await waitFor(async () => {
    if (backendProc.exitCode !== null) {
      throw new Error(`Backend exited during startup. Logs:\n${backendLogs}`);
    }
    const res = await axios.get(`${BASE_URL}/api/health`, {
      validateStatus: () => true
    });
    return res.status === 200;
  }, 30000, 500);

  if (!backendStarted) {
    throw new Error(`Backend failed to start on port 5050. Logs:\n${backendLogs}`);
  }

  const loginRes = await request("POST", "/api/auth/admin/login", {
    emailOrPhone: "admin_api_test@example.com",
    password: "AdminPass123!"
  });

  expect(loginRes.status).toBe(200);
  adminToken = loginRes.json?.token || loginRes.json?.accessToken || null;
  expect(adminToken).toBeTruthy();
});

afterAll(async () => {
  if (backendProc && !backendProc.killed) {
    backendProc.kill("SIGTERM");
  }
  if (mlProc && !mlProc.killed) {
    mlProc.kill("SIGTERM");
  }
});

describe("API smoke coverage", () => {
  test("health endpoint responds", async () => {
    const res = await request("GET", "/api/health");
    expect(res.status).toBe(200);
  });

  test("invalid queue token returns 400 (fixed)", async () => {
    const res = await request("GET", "/api/queue/status/ABC");
    expect(res.status).toBe(400);
  });

  test("public events endpoint responds", async () => {
    const res = await request("GET", "/api/events");
    expect(res.status).toBe(200);
  });

  test("unauthorized me endpoint is protected", async () => {
    const res = await request("GET", "/api/auth/me");
    expect(res.status).toBe(401);
  });

  test("authorized admin queue list responds", async () => {
    const res = await request("GET", "/api/queue", null, adminToken);
    expect(res.status).toBe(200);
  });

  test("ml train no longer returns 500 (fixed)", async () => {
    const res = await request("POST", "/api/ml/train", {}, adminToken);
    expect([200, 400]).toContain(res.status);
  });

  test("ml predict invalid input returns 400 (TC17)", async () => {
    const res = await request("POST", "/api/ml/predict", {
      type: "queue-length",
      hour: "invalid-hour"
    });
    expect(res.status).toBe(400);
    expect(String(res.json?.message || "")).toContain("hour");
  });
});
