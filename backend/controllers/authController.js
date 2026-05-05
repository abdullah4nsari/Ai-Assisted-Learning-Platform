import jwt from "jsonwebtoken";
import User from "../models/User.js";

//generate jwt token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

//@desc Register new user
//@route POST/api/auth/register
//@access public
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    console.log(req.body);
    //check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error:
          userExists.email === email
            ? "Email already registered, try with different email."
            : "Username already taken",
        statusCode: 400,
      });
    }

    //create user if not exists
    const user = await User.create({
      username,
      email,
      password,
    });

    //generate token
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
        },
        token: token,
      },
      message: "User registered successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Server error",
      statusCode: 500,
    });
    next(error);
  }
};

//@desc login user
//@route POST/api/auth/login
//@access public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "please provide email and password",
        statusCode: 400,
      });
      
    }
    console.log(`received a request of email:${email}, password:${password}`);
    //check for password (include password for comparison)
    const user = await User.findOne({ email }).select("+password");
    // console.log(user);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
        statusCode: 401,
      });
    }

    //check if password matches
    const isMatch = await user.matchPassword(password);
    // console.log(isMatch);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
        statusCode: 401,
      });
    }

    //generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
        },
        token: token,
      },
      message: "Login successful",
    });
  } catch (error) {
     console.error(error);
    res.status(500).json({
      success: false,
      error: "Server error",
      statusCode: 500,
    });
    next(error);
  }
};
//@desc get user profile
//@route GET/api/auth/profile
//@access private
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
        success:true,
        data:{
            id:user._id,
            username:user.username,
            email:user.email,
            profileImage:user.profileImage,
            createdAt:user.createdAt,
            updatedAt:user.updatedAt
        }
    })

  } catch (error) {
    next(error);
  }
};

//@desc update user profile
//@route PUT/api/auth/profile
//@access private
export const updateProfile = async (req, res, next) => {
  try {
    const {username, email, profileImage} = req.body;

    const user = await User.findById(req.user._id);
    if(username) user.username=username;
    if(email) user.email=email;
    if(profileImage) user.profileImage=profileImage;

    await user.save();

    res.status(200).json({
        success:true,
        data:{
            id:user._id,
            usernmae: user.username,
            email: user.email,
            profileImage: user.profileImage,
        },
        message:"Profile updated successfully"
    })

  } catch (error) {
    next(error);
  }
};

//@desc change password
//@route POST/api/auth/change-password
//@access private
export const changePassword = async (req, res, next) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        success: false,
        error: "Request body is missing",
        statusCode: 400
      });
    }
    
    const { currentPassword, newPassword} = req.body;
    if(!currentPassword || !newPassword){
        return res.status(400).json({
            success:false,
            error:"Please provide current and new password",
            statusCode:400
        });
    }

    const user = await User.findById(req.user._id).select('+password');

    //check if current password is correct
    if(!(await user.matchPassword(currentPassword))){
        return res.status(401).json({
            success:false,
            error:"Current password is incorrect",
            statusCode:401
        })
    }

    //set new password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
        success:true,
        message:"Password changed successfully"
    })
  } catch (error) {
    next(error);
  }
};
