import {User} from "../model/user.model.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/AsyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
//login,logout,refreshtoken
//create refreshtoken so that  we can use it while creating the user
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        if(!user){
            throw new ApiError(500, "User not found while trying to genrate access and refresh token")
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
    
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false})
        return {accessToken, refreshToken}
    } catch (error) {
        console.log("Failed to generate access and refresh token", error);
        
        throw new ApiError(500, "Failed to generate access and refresh token")
    }
}
const registerUser = asyncHandler(async (userData) => {
    const {
        username, // Create username from email
        email, 
        fullname,
        password, 
        roleId
    } = userData
    if(
        [username, email, fullname, password, roleId].some((field) => !field)
    ){
        throw new ApiError(400, "All fields are required")
    }
    //check if user already exists in mongodb using or operator
    const existedUser = await User.findOne({
        $or: [
            { username: username.toLowerCase() }, 
            { email: email.toLowerCase() }
        ]
    })

    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }
    try {
        // const salt = await bcrypt.genSalt(10)
        // const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            fullname: fullname.toLowerCase(),
            password: password,
            role: roleId._id
        })
        
        const createdUser = await User.findById(user._id).select("-password -refreshToken")
        if(!createdUser){
            throw new ApiError(500, "User not created while registering a user")
        }
        return createdUser
    } catch (error) {
        console.log("user creation failed", error);
        throw new ApiError(500, "User not created while registering a user")
    }
})
const loginUser = asyncHandler(async(req, res) => {
    console.log(req.body);
    const {name, email, password} = req.body
    if(!email || !password){
        throw new ApiError(400, "Email and password is required");
    }
    const user = await User.findOne({
        $or: [{name}, {email}]
    })
    if(!user){
        throw new ApiError(409, "User with email or username not found")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(409, "Invalid user credentials");
    }
    const {accessToken, refreshToken} = await 
    generateAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken")
    if(!loggedInUser){
        throw new ApiError(409, "Logged in user not found in DB");
    }
    const options = {
        httpOnly: true,
        sceure: process.eventNames.NODE_ENV === "production"
    }
    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(
        200, 
        {user: loggedInUser, accessToken: accessToken}, 
        "User logged in successfully"
    ))
})
const logoutuser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined,
            }
        },
        {new: true}
    )
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    }
     return res
     .status(200)
     .clearCookie("accessToken", options)
     .clearCookie("refreshToken", options)
     .json(new ApiResponse(200, "User logged out successfully"))
})
const refreshAccessToken = asyncHandler(async(req, res) => {

})

export {
    loginUser,
    logoutuser,
    registerUser,
    refreshAccessToken
}