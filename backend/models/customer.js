const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: String,
    mobile: {
      type: String,
      required: true,
      unique: true
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);