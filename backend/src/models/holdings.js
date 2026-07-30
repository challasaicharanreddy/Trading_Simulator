import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    portfolio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "portfolios",
        required: true,
    },
    symbol: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "stocks",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    }
});
export default mongoose.model("Holding", userSchema);