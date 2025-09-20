import { Request, Response } from "express";
import { emailExists, createUser } from "../services/user.service";
import { uploadDataUrl } from "../services/cloudinary.service";
import { hashPassword } from "../utils/password";

export async function registerUser(req: Request, res: Response) {
  try {
    // Parse JSON body first; in upload mode, fields come with multer
    if (await emailExists(req?.body?.email)) {
      return res.status(409).json({ error: "Email is already in use." });
    }

    const registrationMode = req?.body?.registration_mode;

    let profile_pic_url = "";
    let attendance_pic_url = "";

    // live mode: expect base64 data URLs in body
    if (!req?.body?.attendance_pic_url) {
      return res.status(400).json({
        error: "ImagesRequired",
        details: "Attendance Picture is required for live mode",
      });
    }

    if (req?.body?.profile_pic_url) {
      profile_pic_url = (
        await uploadDataUrl(req?.body?.profile_pic_url, "users/profile")
      ).secure_url;
    }

    attendance_pic_url = (
      await uploadDataUrl(req?.body?.attendance_pic_url, "users/attendance")
    ).secure_url;

    const password_hash = await hashPassword(req?.body?.password);

    const user = await createUser({
      first_name: req?.body?.first_name,
      last_name: req?.body?.last_name,
      email: req?.body?.email,
      password_hash,
      profile_pic_url: profile_pic_url || attendance_pic_url,
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
    console.log("Error :--", err);
    return res.status(500).json({ error: "ServerError" });
  }
}
