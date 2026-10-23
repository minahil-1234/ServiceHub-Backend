import { verifyJWT } from "../middlewares/auth.middleware.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, username } = req.body;

  if (!email || !password || !username || !firstName || !lastName ) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (existingUser) {
    throw new ApiError(400, "User already existed");
  }

  const user = await User.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    password,
    username,
    role: "client",
  });

  const createdUser = await User.findById(user._id).select("-password ");

  if (!createdUser) {
    throw new ApiError(400, "Something went wrong, user not created");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User doesn't exist");
  }

  const isMatch = await bcrypt.compare(password, user.password); // user.password means jo DB m signin krtay huay password same hua tha wo or password means jo user login krtay huay password enter kr raha h ya dono password same honay chahyay
  if (!isMatch) {
    throw new ApiError(401, "Invalid password");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false, // only for localhost
    sameSite: "lax",
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, // only for localhost
    sameSite: "lax",
  });
  user.refreshToken = refreshToken;
  await user.save();

  const loggedIn = await User.findById(user._id).select("-password "); // select("-password") is sa ya hota h k db m to original sara data jana hi hota hai lakin is sa password frontend m ni show hota like agr koi user kisi website m login kr raha h to uska response hum network m dkeh sktay hain but jb hum select laga detay hain to frontend sa wo cheez minus ho jati hai means phr humay network m password show ni ho ga. but db m ho ga q k original data ka part h password or original data db m lazmii show hota h

  return res
    .status(200)
    .json(new ApiResponse(200, { loggedIn }, "User logged In Successfully"));
});

const userEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User doesn't exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { email }, "Email verified successfully"));
});

const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) throw new ApiError(400, "All fields are required");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(400, "User not Existed");

  const otp = Math.floor(100000 + Math.random() * 900000);

  user.otp = otp;
  user.otpExpiry = Date.now() + 10 * 60 * 1000;
  await user.save();

  // 🔥 CREATE TRANSPORTER HERE
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Your OTP Code",
      text: `Your otp is: ${otp}`,
    });

    console.log("📧 EMAIL SENT SUCCESS");
  } catch (error) {
    console.log("❌ EMAIL ERROR:", error.message);

    throw new ApiError(500, "Failed to send OTP email");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "OTP sent successfully"));
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp, purpose } = req.body;

  console.log("REQ:", email, otp, purpose);

  if (!email || !otp || !purpose) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  if (!user.otpExpiry || user.otpExpiry < Date.now()) {
    throw new ApiError(400, "OTP Expired");
  }

  if (Number(otp) !== Number(user.otp)) {
    throw new ApiError(400, "OTP isn't verified");
  }

  if (purpose === "signup") {
    user.isEmailVerified = true;
  } else if (purpose === "forgot-password") {
    user.isOtpVerified = true;
  } else {
    throw new ApiError(400, "Invalid OTP purpose");
  }

  user.otp = null;
  user.otpExpiry = null;

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "OTP verified successfully"));
});

const getUserInfo = asyncHandler(async (req, res) => {
  const userData = {
    name: req.user.firstName,
    email: req.user.email,
    role: req.user.role,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, { userData }, "User Data Fetched Successfully"));
});

const changePassword = asyncHandler(async (req, res) => {
  const { newPassword, confirmPassword, email } = req.body;

  if (!email || !newPassword || !confirmPassword) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  if (!user.isOtpVerified) {
    throw new ApiError(400, "OTP is not verified");
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "Passwords must match");
  }
  user.password = newPassword; // q k hum na phlay user k password ko bcrypt kia hua is liyay ab bss password ko newpassword sa replace kr dain gay
  user.isOtpVerified = false;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  const decodedToken = verifyJWT(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET,
  );
  const user = await User.findById(decodedToken._id);

  if (incomingRefreshToken !== user.refreshToken) {
    throw new ApiError(401, "Refresh Token is Expired");
  }

  const newAccessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  user.refreshToken = newRefreshToken;
  await user.save();
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $unset: { refreshToken: 1 },
  });

  return res
    .status(200)
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    })
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    })
    .json(new ApiResponse(200, {}, "Logout Successful"));
});

export {
  registerUser,
  userLogin,
  userEmail,
  sendOtp,
  verifyOtp,
  changePassword,
  refreshAccessToken,
  getUserInfo,
  logoutUser,
};
