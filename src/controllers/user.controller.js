import{asyncHandler} from "../utils/asyncHandlar.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import jwt from 'jsonwebtoken';


const generateAccessAndRefreshToken=async(userId)=>{
    try {
       const user= await User.findById(userId) 
       const accessToken=user.generateAccessToken()
       const refreshToken=user.generateRefreshToken()
       user.refreshToken=refreshToken
      await user.save({validateBeforeSave:false})
      return{accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something went wrong while making token")
        
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;



    // Check if any required field is empty
    if ([username, email, password].some(field => !field || field.trim() === "")) {
        console.log(email);
        throw new ApiError(400, "All fields are required");
    }

    // Email validation using regular expression
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Invalid email format");
    }

    // Check if username is unique
    const userByUsername = await User.findOne({ username });
    if (userByUsername) {
        throw new ApiError(400, "Username already exists");
    }

    // Check if email is unique
    const userByEmail = await User.findOne({ email });
    if (userByEmail) {
        throw new ApiError(400, "Email already exists");
    }

    const user= await User.create({
        username,
        email,
        password
    })

    const createdUser= await User.findById(user._id).select(
        "-password  -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"something went wrong while register")
    }
    return res.status(201).json(
        new ApiResponse(200,createdUser,"user registered sucessfully")
    )




});


const loginUser=asyncHandler(async(req,res)=>{

const{email,username,password}=req.body

if(!username && !email){
    throw new ApiError(400,"username or password is required")
        }
        const user=await User.findOne({
            $or:
            [{username},{email}]
            
        })
        if(!user){
            throw new ApiError(404,"User not found")
        }

        const isPasswordValid=await user.isPasswordCorrect(password)
        console.log(password);
        if(!isPasswordValid){
            throw new ApiError(401,"Invalid user credentials")
        }

       const {accessToken,refreshToken}= await generateAccessAndRefreshToken(user._id)
        
        const loggedInUser= await User.findById(user._id).select("-password -refreshToken")

        const options = {
            httpOnly:true,
            secure:true
        }

        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(200,{
                user:loggedInUser,accessToken,refreshToken
            },
        "user logged in successfully")
        )
    })
 const logoutUser=asyncHandler(async(req,res)=>{
          await User.findByIdAndUpdate(
                req.user._id,
                {
                    $set:{
                        refreshToken:undefined
                    }
                },
                {
                    new:true
                }
            )

            const options = {
                httpOnly:true,
                secure:true
            }
            return res.status(200)
            .clearCookie("accessToken",options)
            .clearCookie("refreshToken",options)
            .json(new ApiResponse(200,{},"User logged out"))
        })

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        throw new ApiError(401,"unauthorized request")
    }
try {
        const decodeToken=jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user=await User.findById(decodeToken?._id)
        if (!user) {
            throw new ApiError(401,"invalid refresh token")
            
        }
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"refresh token is expire or used")
        }
        const options={
            httpOnly:true,
            secure:true
        }
        const {accessToken,newRefreshToken}=await generateAccessAndRefreshToken(user._id)
        return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(200,{accessToken,refreshToken},"access token refreshed")
        )
    
} catch (error) {
    throw new ApiError(401,error?.message || "invalid refresh token")
    
}


})
      

const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    status: 200,
    data: req.user._id,
    message: "Current user fetched successfully"
  });
});

export { registerUser,loginUser,logoutUser,refreshAccessToken,getCurrentUser };
