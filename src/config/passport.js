import passport from "passport";
import localStrategy from "../middlewares/passport/localStrategy.js";
import jwtStrategy from "../middlewares/passport/jwtStrategy.js";
import googleStrategy from "../middlewares/passport/googleStrategy.js";
import userRepository from "../repositories/userRepository.js";

passport.use("local", localStrategy);
passport.use("access-token", jwtStrategy.accessTokenStrategy);
passport.use("refrsh-token", jwtStrategy.refreshTokenStrategy);
passport.use(googleStrategy);

passport.serializeUser((user, done) => {
  console.log("sealizeUser");
  console.log(user);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    console.log("deserialieUser");
    console.log(id);
    const user = await userRepository.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
