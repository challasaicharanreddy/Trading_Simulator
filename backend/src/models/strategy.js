import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    symbol: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "stocks",
        required: true,
    },
    indicator: {
        type: String,
        Enum: ["SMA", "EMA", "RSI", "MACD"],
        required: true,
    },
    operator:{
        type: String,
        Enum: ['<', '>'],
        required: true,
    },
    threshold: {
        type: Number,   
        required: true
    },
    action: {
        type: String,
        Enum: ["BUY", "SELL"],
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        Enum: ["ACTIVE", "INACTIVE"],
        default: "ACTIVE",
    }
});
export default mongoose.model("Strategy", userSchema);