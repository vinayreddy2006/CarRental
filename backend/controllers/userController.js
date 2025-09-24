import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Car from "../models/Car.js";

// generate JWT Token
    const generateToken = (userId) => {
        const payload=userId;
        return jwt.sign(payload,process.env.JWT_SECRET);
    }

export const registerUser = async (req,res) => {
    try {
        const {name,email,password}=req.body;
        if(!name || !email || !password || password.length<8) {
            return res.json({success: false ,message:'fill all the fields'});
        } 

        const userExists= await User.findOne({email});
        if(userExists) {
            return res.json({success: false ,message:'User already exists '});
        }

        const hashedPassword= await bcrypt.hash(password,10);
        const user=await User.create({name,email,password:hashedPassword});

        const token=generateToken(user._id.toString());
        res.json({success:true,token })

    } catch (error) {
        console.log(error.message);
        res.json({success:false , message: error.message })
    }
}

//Login user

export const loginUser= async (req,res) =>{
    try {
        const {email,password}=req.body;
        const user= await User.findOne({email});
        if(!user) {
            return res.json({success:false,message:"User not found"})
        }

        const isMatch= await bcrypt.compare(password,user.password);
 
        if(!isMatch) {
            return res.json({success:false, message:"Invalid credentials"})
        }

        const token=generateToken(user._id.toString());
        res.json({success:true,token });


    } catch (error) {
        console.log(error.message);
        res.json({success:false , message: error.message });
    }
}

export const getUserData= async(req,res) => {
    try {
        const {user}= req;
        res.json({success:true,user});
    } catch (error) {
        console.log(error.message);
        res.json({success:false , message: error.message });
    }
}

// Get all the cars for the frontend

export const getCars= async(req,res) => {
    try {
        const cars=await Car.find({isAvailable: true});
        console.log("CAR: ",Car);
        res.json({success:true,cars});
    } catch (error) {
        console.log(error.message);
        res.json({success:false , message: error.message });
    }
}
