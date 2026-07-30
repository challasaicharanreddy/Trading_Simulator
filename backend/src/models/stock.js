import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({    
    symbol: {
        type: String,
        required: true,
        unique: true
    },
    CompanyName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        Enum: ["ACTIVE", "INACTIVE"],
        required: true
    }
});
export default mongoose.model("Stock", userSchema);