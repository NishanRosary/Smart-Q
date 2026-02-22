const assert = require("assert");
const User = require("../models/user");
const { login } = require("../controllers/authControllers");

/**
 * Example unit-style test case:
 * incorrect password must return 401 + "Invalid credentials" and no token.
 */
async function loginRejectsIncorrectPasswordExample() {
  const originalFindOne = User.findOne;

  try {
    User.findOne = async () => ({
      _id: "507f191e810c19729de860ea",
      name: "Test User",
      email: "user@example.com",
      phone: null,
      role: "customer",
      isActive: true,
      comparePassword: async () => false
    });

    const req = {
      body: {
        emailOrPhone: "user@example.com",
        password: "wrong-password"
      }
    };

    const res = {
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      }
    };

    await login(req, res);

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.message, "Invalid credentials");
    assert.ok(!res.body.token, "Token must not be returned for invalid password");
  } finally {
    User.findOne = originalFindOne;
  }
}

module.exports = {
  loginRejectsIncorrectPasswordExample
};
