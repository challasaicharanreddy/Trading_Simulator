import app from "./app.js";
import connectdb from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();
const PORT=process.env.PORT;

const startserver=async ()=>{
    await connectdb();
    app.listen(PORT,()=>{
        console.log(`server running on port ${PORT}`);
    });
}
startserver();