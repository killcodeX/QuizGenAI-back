import { Router, RequestHandler } from "express";
import {
  googleAuth,
  signIn,
  signUp,
  delUser,
} from "../controllers/authControler";
import passport from "./passport";

const router = Router();

// router.get(
//   "/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// router.get(
//   "/google/callback",
//   passport.authenticate("google", { failureRedirect: "/login" }),
//   (req, res) => {
//     res.json({ message: "Google login successful", user: req.user });
//   }
// );

// Add this route to your router
router.post("/google-auth", googleAuth as unknown as RequestHandler);
router.post("/signup", signUp as unknown as RequestHandler);
router.post("/login", signIn as unknown as RequestHandler);
router.post("/del-user", delUser as unknown as RequestHandler);

export default router;
