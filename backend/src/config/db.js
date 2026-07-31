import mongoose from "mongoose";

export default async function() {
    try {
        const conn=await mongoose.connect(process.env.MONGO_URI);
        console.log("Database connected");
    }catch(err) {
        console.log("Error in connecting to DB");
    }
}