import jwt from "jsonwebtoken";
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: Number,
    },
    otpExpiry: {
      type: Date,
    },
    isOtpVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["client", "freelancer", "admin"],
      default: "client",
    },
    refreshToken: {
      type: String,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true },
);

userSchema.pre("save", async function () {
  // pre("save") aik mongoose middleware hai db m save honay sa phlay ya function run ho ga
  if (!this.isModified("password")) return; // this means current user. is line m ya hai k agr password old hai to wesay hi return krdo q k old password already hashed hai lakin agr password new hai means update hua h to usay hash krdo

  this.password = await bcrypt.hash(this.password, 10); // here 10 called co-factor through which password takes time to convert into hash password
});

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      fullName: this.fullName,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
};

export const User = mongoose.model("User", userSchema);

// "Hashing aur verification dono thore slow ho jayenge, lekin brute-force attacks ke against security improve ho jayegi. Isliye cost factor security aur performance ke beech balance choose karne ke liye use hota hai."//
// Hashing (password in string form)
// ✅ Salt (special string that helps in hashing the password)
// ✅ bcrypt.compare(): it compare in a way that it took the salt from db hash password and through that salth it hash the enterd password in login and than compare both password login and db password
// ✅ pre("save")
// ✅ isModified()
// ✅ Cost Factor (10)
// ✅ Version (2b) // these are different version in bcrypt library like 2a,2b,2y and now a days most commonly used is 2a and it is done by bcrypt library
// ✅ Hash ki internal structure
