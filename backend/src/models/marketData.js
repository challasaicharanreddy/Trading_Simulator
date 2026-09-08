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
    { expireAfterSeconds: 1 * 24 * 60 * 60 }
);
userSchema.index(
    { symbol: 1, timestamp: 1 },
    { unique: true }
);

export default mongoose.model("MarketData", userSchema);