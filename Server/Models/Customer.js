const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  id_customer: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  licence: {
    status: {
      type: String,
      enum: ["active", "inactive", "free"],
      default: "active",
    },
    cost: {
      type: Number,
      required: false,
    },
    expiration_date: {
      type: Date,
    },
  },
});

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
