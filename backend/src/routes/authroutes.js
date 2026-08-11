import express from "express"
import users from "../models/users.js";
import Portfolio from "../models/portfolio.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import commonMiddleware from "../middlewares/common.middleware.js";

const Model=users;
const router=express.Router()

router.post("/register",async (req,res)=>{
    console.log(req)
    const info=req.body;
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: "username, email, and password are required" });
    }
    const finduser=await Model.findOne({email:info.email});
    if(finduser) {
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

    await Portfolio.create({
        user: user._id,
        cashBalance: 1000000, 
    });

    return res.status(201).json({
        message:"User registered succcessfully. Please log in"
    });
});

router.post("/login",async (req,res)=>{
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
    res.cookie("accessToken", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
        message:"User logged in succesfully"
    });
});

router.post("/logout",(req,res)=>{
    res.clearCookie("accessToken");

    return res.status(200).json({
        message:"User logged out successfully"
    });
});

router.get("/me", commonMiddleware, async (req, res) => {
    const user = await Model.findById(req.user.id).select("-password");
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
});

export default router;