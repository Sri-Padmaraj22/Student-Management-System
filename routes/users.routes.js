import express from 'express';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { user as User } from '../models/users.models.js';
dotenv.config();
export const router=Router();
const app=express();

router.post('/register',async (req,res)=>{
  try{
    const {username,email,password}=req.body;
    const existingUser=await User.findOne({$or:[{username},{email}]});
    if(existingUser)
      return res.status(400).json({message:'Username or email already exists'});
    const hashedPassword= await bcrypt.hash(password,10);
    const user=new User({username,email,password:hashedPassword});
    const savedUser=await user.save();
    return res.json(savedUser);
  }

  catch(err){
    return res.status(500).json({message:err.message});
  }

});


router.post('/login',async (req,res)=>{
  try
    {
      const {username,password}=req.body;
      const user= await User.findOne({username});
      if(!user)
        return res.status(404).json({message:'User not found'});
      const isMatch=await bcrypt.compare(password,user.password);
      if(!isMatch)
        return res.status(400).json({message:'Invalid Credentials'});

      const token=jwt.sign({userId:user._id,username:user.username},process.env.JWT_SECRET,{expiresIn:'1h'});

      res.json({token});
    }
  catch(err)
    {
      return res.status(500).json({message:err.message});
    }

});


router.post('/logout',async (req,res)=>{
  res.json({message:'Logged out Successfully'});
});


