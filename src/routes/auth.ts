import { Router, RequestHandler } from "express";
import { signIn, signUp } from "../controllers/authControler";
import passport from "./passport";

const router = Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.json({ message: "Google login successful", user: req.user });
  }
);

router.post("/signup", signUp as RequestHandler);
router.post("/login", signIn as RequestHandler);

export default router;
