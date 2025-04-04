import { Router } from "express";
import {
    loginUser,
    logoutuser,
    refreshAccessToken
} from "../controllers/user.controller.js";
import {verifyJwt} from "../middlewares/auth.middleware.js";

const router = Router()
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken)
router.route("/logout").post(verifyJwt,logoutuser);

export default router;