import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import userService from "../../services/userService.js";

const accessTokenOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

const refreshTokenOptions = {
  jwtFromRequest: (req) => req.cookies["refreshToken"],
  secretOrKey: process.env.JWT_SECRET,
};

async function jwtVerify(payload, done) {
  try {
    console.log("jwt verify");
    const { userId } = payload;
    const user = await userService.getUserById(userId);
    console.log(user);
    if (!user) {
      return done(null, false);
    }
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}

const accessTokenStrategy = new JwtStrategy(accessTokenOptions, jwtVerify);
const refreshTokenStrategy = new JwtStrategy(refreshTokenOptions, jwtVerify);

export default {
  accessTokenStrategy,
  refreshTokenStrategy,
};
