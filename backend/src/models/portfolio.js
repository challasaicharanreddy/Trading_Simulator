import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({    
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
        unique: true,
      },
      cashBalance: {
        type: Number,
        required: true,
        default: 1000000,
        min: 0,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      }
    }
);

export default mongoose.model('Portfolio', userSchema);