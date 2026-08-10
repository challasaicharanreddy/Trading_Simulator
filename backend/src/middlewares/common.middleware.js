import jwt from "jsonwebtoken";

export default function(req,res,next) {
    try {
        const token=req.cookies.token;
        if(!token) {
            return res.status(201).json({
                message:"Please login first"
            });
        }
        const valid=jwt.verify(token,process.env.JWT_SECRET)
        req.user=valid;
        // console.log(valid);
        next();
    } catch(err) {
        return res.status(401).json({
            message:"Invalid or expired token"
        });
    }
}