import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({    
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
        unique: true,
      },
  
      cash: {
        type: Number,
        required: true,
        default: 1000000,
        min: 0,
      },
      totalInvested: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
      }
    }
);

export default mongoose.model('Portfolio', userSchema);