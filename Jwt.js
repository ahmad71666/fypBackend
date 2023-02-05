require("dotenv").config();
const {sign,verify} = require("jsonwebtoken");

const createTokens = (user)=>{
    const accessToken = sign({email:user.email,id:user._id},
        process.env.ACCESS_TOKEN_SECRET,{expiresIn:"30m"});
    return accessToken;
}

const validateToken = (req,res,next) =>{
    const accessToken = req.cookies["access-token"];

    if(!accessToken){
        return res.sendStatus(400).json({error:"User Not Authenticated"});
    }

    try{
        const validToken = verify(accessToken,process.env.ACCESS_TOKEN_SECRET);
        if(validToken){
            req.authenticated = true;
            return next();
        }

    }catch(err){
        return res.sendStatus(400).json({error:err});
    }
}




module.exports = {createTokens,validateToken};
