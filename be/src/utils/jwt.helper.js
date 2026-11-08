import jwt from "jsonwebtoken";
import { config } from "../config/env.config.js";

export const generateToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

const tokenBlacklist = new Set();

export const blacklistToken = (token) => {
  if (token) {
    tokenBlacklist.add(token);
  }
};

export const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};
