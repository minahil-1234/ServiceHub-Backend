import { Router } from "express";
import { changePassword, getUserInfo, logoutUser, refreshAccessToken, registerUser, sendOtp, userEmail, userLogin, verifyOtp } from "../controllers/user.controller.js";
import { createProject, deleteProject, getAllClients, getAllProjects, getMyProjects, updateProject, updateProjectStatus } from "../controllers/project.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/sign-up").post(registerUser)
router.route("/login").post(userLogin)
router.route("/user-email").post(userEmail)
router.route("/send-otp").post(sendOtp)
router.route("/verify-otp").post(verifyOtp)
router.route("/change-password").post(changePassword)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/get-userInfo").get(verifyJWT, getUserInfo)
router.route("/logout-user").post(verifyJWT, logoutUser)

// Project routesa
router.route("/create-project").post(verifyJWT, createProject)
router.route("/get-projects").get(verifyJWT, getMyProjects)
router.route("/update-project/:id").patch(verifyJWT, updateProject)
router.route("/delete-project/:id").delete(verifyJWT, deleteProject)
// router.route("/accept-project/:id").patch(verifyJWT, acceptProject)
router.route("/update-status/:id").patch(verifyJWT, updateProjectStatus)
router.route("/get-all-projects").get(verifyJWT, getAllProjects)
router.route("/get-all-clients").get(verifyJWT, getAllClients)
 
export default router