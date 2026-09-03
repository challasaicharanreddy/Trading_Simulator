import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    symbol: {
        type: String,
        required: true,
    },
    indicator: {
        type: String,
        enum: ["SMA", "RSI"],
        required: true,
    },
    period: {
        type: Number,
        required: true,
    },
    operator:{
        type: String,
        enum: ['<', '>'],
        required: true,
    },
    threshold: {
        type: Number,   
        required: true
    },
    action: {
        type: String,
        enum: ["BUY", "SELL"],
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE"],
        default: "ACTIVE",
        },
    },
    {
        timestamps: true,
    }
);

userSchema.index(
    { user: 1, name: 1 },
    { unique: true }
  );

export default mongoose.model("Strategy", userSchema);