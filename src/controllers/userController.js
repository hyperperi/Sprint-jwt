import express from "express";
import passport from "../config/passport.js";
import userService from "../services/userService.js";
import auth from "../middlewares/jwtAuth.js";

const userController = express.Router();

userController.post("/users", async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    return res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

userController.post(
  "/login",
  passport.authenticate("local", { session: false }),
  async (req, res, next) => {
    console.log("Token login");
    const { email, password } = req.body;
    try {
      const user = await userService.getUser(email, password);
      const accessToken = userService.createToken(user);
      const refreshToken = userService.createToken(user, "refresh");
      await userService.updateUser(user.id, { refreshToken });
      res.cookie("refreshToken", refreshToken, {
        path: "/token/refresh",
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
      return res.json({ accessToken });
    } catch (error) {
      next(error);
    }
  }
);

userController.post(
  "/session-login",
  passport.authenticate("refresh-token", { session: false }),
  async (req, res, next) => {
    try {
      const { refreshToken } = req.cookies;
      const user = await userService.getUser(email, password);
      const { id: userId } = req.user;
      const { accessToken, newRefreshToken } = await userService.refreshToken(
        userId,
        refreshToken
      );
      await userService.updateUser(userId, { refreshToken: newRefreshToken });
      res.cookie("refreshToken", newRefreshToken, {
        path: "/token/refresh",
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
      return res.json({ accessToken });
    } catch (error) {
      next(error);
    }
  }
);

userController.post(
  "/session-login",
  passport.authenticate("local"),
  async (req, res, next) => {
    const user = req.user;
    return res.json(user);
  }
);

userController.post("/session-logout", async (req, res, next) => {
  console.log("logout before");
  console.log(req.session);
  req.session.destroy();
  console.log("logout after");
  console.log(req.session);
  res.status(200).send();
});

userController.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// 리다이렉션
userController.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res, next) => {
    console.log("google callback");
    console.log(req.user);
    const { id } = req.user;
    const accessToken = userService.createToken(id);
    const refreshToken = userService.createToken(id, "refresh");
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    return res.json({ accessToken });
  }
);

export default userController;
