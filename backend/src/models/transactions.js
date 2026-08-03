import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  portfolio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "portfolios",
    required: true,
  },
  symbol: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  action: {
    type: String,
    enum: ["BUY", "SELL"],
    required: true,
  },
  executedAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model("Transaction", userSchema);
