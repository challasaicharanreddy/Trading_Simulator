import mongoose from "mongoose";

const candleSchema=new mongoose.Schema({
    symbol: {
        type: String,
        required: true
    },
    // interval:{
    //     type:String,
    //     default:"1MIN"
    // },
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
})
candleSchema.index(
    { timestamp: 1 },
    { expireAfterSeconds: 365 * 24 * 60 * 60 }
);
candleSchema.index({
    symbol:1,
    timestamp:1
})

export default mongoose.model("MinuteCandle", candleSchema);