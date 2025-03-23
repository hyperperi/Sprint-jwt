import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import userRepository from "../repositories/userRepository.js";

async function hashingPassword(password) {
  // 함수 추가
  return bcrypt.hash(password, 10);
}

async function createUser(user) {
  const existedUser = await userRepository.findByEmail(user.email);

  if (existedUser) {
    const error = new Error("User already exists");
    error.code = 422;
    error.data = { email: user.email };
    throw error;
  }

  const hashedPassword = await hashingPassword(user.password);
  const createdUser = await userRepository.save({
    ...user,
    password: hashedPassword,
  }); // password 추가
  return filterSensitiveUserData(createdUser);
}

async function getUser(email, password) {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    const error = new Error("Unauthorized");
    error.code = 401;
    throw error;
  }
  // await!
  await verifyPassword(password, user.password);
  return filterSensitiveUserData(user);
}

// 추가 함수
async function getUserById(id) {
  const user = await userRepository.findById(id);

  if (!user) {
    const error = new Error("Not Found");
    error.code = 404;
    throw error;
  }

  return filterSensitiveUserData(user);
}

async function updateUser(id, data) {
  const user = await userRepository.update(id, data);
  return user;
}

async function oauthCreateOrUpdate(provider, providerId, email, name) {
  const user = await userRepository.createOrUpdate(
    provider,
    providerId,
    email,
    name
  );
  return filterSensitiveUserData(user);
}

async function refreshToken(userId, refreshToken) {
  const user = await userRepository.findById(userId);
  if (!user || user.refreshToken !== refreshToken) {
    const error = new Error("Unauthorized");
    error.code = 401;
    throw error;
  }
  const accessToken = createToken(user);
  const newRefreshToken = createToken(user, "refresh");
  return { accessToken, newRefreshToken };
}

async function verifyPassword(inputPassword, savedPassword) {
  const isValid = await bcrypt.compare(inputPassword, savedPassword);
  if (!isValid) {
    const error = new Error("Unauthorized");
    error.code = 401;
    throw error;
  }
}

function filterSensitiveUserData(user) {
  const { password, refreshToken, ...rest } = user;
  return rest;
}

function createToken(user, type) {
  const payload = { userId: user.id };
  const options = {
    expiresIn: type === "refresh" ? "2w" : "1h",
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, options);
  return token;
}

export default {
  createUser,
  getUser,
  getUserById,
  updateUser,
  oauthCreateOrUpdate,
  createToken,
  refreshToken,
};
