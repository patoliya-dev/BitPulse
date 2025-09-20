import { z } from 'zod';

export const registrationModeEnum = z.enum(['upload', 'live']);

export const registerUserSchema = z.object({
  first_name: z.string().trim().min(1).max(60),
  last_name: z.string().trim().min(1).max(60),
  email: z.string().email().transform((v) => v.toLowerCase()),
  password: z.string().min(8),
  registration_mode: registrationModeEnum,
  // live mode can send base64 strings; upload mode uses multipart files
  profile_pic_base64: z.string().optional(),
  attendance_pic_base64: z.string().optional(),
});
