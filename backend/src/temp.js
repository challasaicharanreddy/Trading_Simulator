// temp.js
import 'dotenv/config';
import mongoose from "mongoose";
import { takeSnapshotsForAllUsers } from "./services/portfolio.services.js";

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  await takeSnapshotsForAllUsers();

  await mongoose.disconnect();
  console.log("Done, disconnected");
  process.exit(0);
}

run().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});