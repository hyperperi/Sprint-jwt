import GoogleStrategy from "passport-google-oauth20";

import userService from "../../services/userService.js";

const GoogleStrategyOptions = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback",
};

async function verify(accessToken, refreshToken, profile, done) {
  console.log("verify google oauth");
  console.log(accessToken);
  console.log(refreshToken);
  console.log(profile);

  const user = await userService.oauthCreateOrUpdate(
    profile.provider,
    profile.id,
    profile.emails[0].value,
    profile.displayName
  );
  done(null, user);
}

const GoogleStrategyAuth = new GoogleStrategy(GoogleStrategyOptions, verify);

export default GoogleStrategyAuth;
