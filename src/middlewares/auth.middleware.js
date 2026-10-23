import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken";


export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");  
      // || OR operator means agr cookie m token nhi mila to dosri jaga check krlo
      // req.header("Authorization")?.replace("Bearer ", "");  this line shows the complt token in header looks like Bearer abc123 but if dont want bearer text with it so we replace the bearer

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
        "-password -refreshToken"
    )

    if(!user){
        throw new ApiError(401, "Inavlid Access Token")
    }

    req.user = user
     next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Inavlid Access Token");
  }
});




// req.cookies?.accessToken ?. ya optional hota hai iska mtlb hai k agr cookie hai to token da do warna undefined show krdo
// jwt.verify() ya token ko decode (data in readable form like email, username) b krta h or verify b ab   const decodedToken is variable m ya check kray ga k jo token server ko mil raha h login request py kia wo jo hamara token para hua b env m us sa same hai ya ni means secret key, expiry, fake to ni ya sb check krta h return m huamy milay ga decoded token
// encoded means data in a string form that travels between systems or server