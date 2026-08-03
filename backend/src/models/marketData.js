import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    symbol: {
        type: String,
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
    timestamp: {
        type: Date,
        default: Date.now
    }
});

userSchema.index(
    { timestamp: 1 },
    { expireAfterSeconds: 20 * 24 * 60 * 60 }
);

export default mongoose.model("MarketData", userSchema);