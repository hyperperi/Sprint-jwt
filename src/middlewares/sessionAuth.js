function passportAuthenticateSession(req, res, next) {
  console.log("passport auth session");
  console.log(req.session);
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  return next();
}

export default {
  passportAuthenticateSession,
};
