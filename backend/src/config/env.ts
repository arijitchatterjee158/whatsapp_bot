import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",

  port: Number(process.env.PORT || 3000),

  mongodbUri: getRequiredEnv("MONGODB_URI"),

  redisUrl: getRequiredEnv("REDIS_URL"),

  jwtSecret: getRequiredEnv("JWT_SECRET"),
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"],


  meta: {
    accessToken: getRequiredEnv("META_ACCESS_TOKEN"),
    phoneNumberId: getRequiredEnv("META_PHONE_NUMBER_ID"),
    wabaId: getRequiredEnv("META_WABA_ID"),
    verifyToken: getRequiredEnv("META_VERIFY_TOKEN"),
  },

  whatsapp: {
    templateName: getRequiredEnv("WHATSAPP_TEMPLATE_NAME"),
    templateLanguage:
      process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en_US",
  },
};