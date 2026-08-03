import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
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
    },
    avgCostPrice: {
        type: Number,
        required: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});
export default mongoose.model("Holding", userSchema);