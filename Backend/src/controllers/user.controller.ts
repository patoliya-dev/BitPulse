import { Request, Response } from 'express';
import { registerUserSchema } from '../schemas/user.schema';
import { emailExists, createUser } from '../services/user.service';
import { uploadImageBuffer, uploadDataUrl } from '../services/cloudinary.service';
import { hashPassword } from '../utils/password';

export async function registerUser(req: Request, res: Response) {
  try {
    // Parse JSON body first; in upload mode, fields come with multer
    const parsed = registerUserSchema.parse(req.body);

    if (await emailExists(parsed.email)) {
      return res.status(409).json({ error: 'EmailAlreadyUsed' });
    }

    const registrationMode = parsed.registration_mode;

    let profile_pic_url = '';
    let attendance_pic_url = '';

    if (registrationMode === 'upload') {
      const files = req.files as Record<string, Express.Multer.File[]>;
      const profile = files?.profile_pic?.[0];
      const attendance = files?.attendance_pic?.[0];
      if (!profile || !attendance) {
        return res.status(400).json({ error: 'ImagesRequired', details: 'profile_pic and attendance_pic are required for upload mode' });
      }
      profile_pic_url = (await uploadImageBuffer(profile.buffer, 'users/profile')).secure_url;
      attendance_pic_url = (await uploadImageBuffer(attendance.buffer, 'users/attendance')).secure_url;
    } else {
      // live mode: expect base64 data URLs in body
      if (!parsed.profile_pic_base64 || !parsed.attendance_pic_base64) {
        return res.status(400).json({ error: 'ImagesRequired', details: 'profile_pic_base64 and attendance_pic_base64 are required for live mode' });
      }
      profile_pic_url = (await uploadDataUrl(parsed.profile_pic_base64, 'users/profile')).secure_url;
      attendance_pic_url = (await uploadDataUrl(parsed.attendance_pic_base64, 'users/attendance')).secure_url;
    }

    const password_hash = await hashPassword(parsed.password);

    const user = await createUser({
      first_name: parsed.first_name,
      last_name: parsed.last_name,
      email: parsed.email,
      password_hash,
      profile_pic_url,
      attendance_pic_url,
      registration_mode: registrationMode,
    });

    return res.status(201).json({
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      profile_pic_url,
      attendance_pic_url,
      registration_mode: registrationMode,
      createdAt: user.createdAt,
    });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return res.status(400).json({ error: 'ValidationError', details: err.errors });
    }
    return res.status(500).json({ error: 'ServerError' });
  }
}
