import app from "../app.js";
import users from "../models/users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const Model=users;

app.post("/auth/register",async (req,res)=>{
    const info=req.body;
    const finduser=await Model.findOne({email:info.email});
    if(!finduser) {
        return res.status(409).json({
            message: "User already exists. Please log in."
        });
    }
    const hashed_password=await bcrypt.hash(info.password,10);
    const user=await Model.create({
        username:info.username,
        email:info.email,
        password:hashed_password
    });

    return res.status(201).json({
        message:"User registered succcessfully. Please log in"
    });
});

app.post("/auth/login",async (req,res)=>{
    const {email,password}=req.body;
    const finduser=await Model.findOne({email});
    if(!finduser) {
        return res.status(409).json({
            message: "User doesn't exist. Please recheck your credentials"
        });
    }
    const ismatch=await bcrypt.compare(password,finduser.password)

    if(!ismatch)  {
        return res.status(410).json({
            message: "Email and password doesn't match."
        });
    }
    const token = jwt.sign(
        {
            id: finduser._id,
            email: finduser.email
        },

        process.env.JWT_SECRET,

        {
            expiresIn: "1d"
        }
    );
    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
        message:"User logged in succesfully"
    });
});

app.post("/auth/logout",(req,res)=>{
    res.clearCookie("token");

    return res.status(201).json({
        message:"User logged out successfully"
    });
});