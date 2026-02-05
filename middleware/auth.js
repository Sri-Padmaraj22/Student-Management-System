import jwt from 'jsonwebtoken';
import { user as User } from '../models/users.models.js';
import dotenv from 'dotenv';
dotenv.config();
export const auth=async (req,res,next)=>{
  try{
    const bearerHeader= req.headers['authorization'];
    if(typeof bearerHeader!='undefined')
    {
      const bearer= bearerHeader.split(' ');
      const token=bearer[1];
      const user=jwt.verify(token,process.env.JWT_SECRET);
      console.log(user);
      req.token=user;
      next();

    }
    else
      return res.status(401).json({message:'No token provided'});
  }
  catch(err)
  {
    return res.status(403).json({message:'Invalid or expired token'});
  }
}