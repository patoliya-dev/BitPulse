import { z } from 'zod';

export const registerUserSchema = z.object({
  first_name: z.string().trim().min(1, { message: 'first_name is required' }),
  last_name: z.string().trim().min(1, { message: 'last_name is required' }),
  email: z.string().email({ message: 'email is invalid' }),
  password: z.string().min(8, { message: 'password must be at least 8 characters' }),
  registration_mode: z.enum(['upload', 'live'], { message: 'registration_mode must be upload or live' }),
  profile_pic_base64: z.string().optional(),
  attendance_pic_base64: z.string().optional(),
});
