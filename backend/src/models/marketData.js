import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    symbol: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "stocks",
        required: true
    },
    open: {
        type: Number,
        required: true
    },
    high: {
        type: Number,
        required: true
    },
    low: {
        type: Number,
        required: true
    },
    close: {
        type: Number,
        required: true
    },
    volume: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("MarketData", userSchema);