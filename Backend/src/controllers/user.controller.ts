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

    const password_hash = await hashPassword(req?.body?.password);

    const user = await createUser({
      first_name: req?.body?.first_name,
      last_name: req?.body?.last_name,
      email: req?.body?.email,
      password_hash,
      profile_pic_url: req?.body?.attendance_pic,
      attendance_pic_url: req?.body?.attendance_pic,
      registration_mode: registrationMode,
    });

    return res.status(201).json({
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (err: any) {
    console.log("Error :--", err);
    return res.status(500).json({ error: "ServerError" });
  }
}
