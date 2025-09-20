import { Schema, model, InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    password_hash: { type: String, required: true },
    profile_pic_url: { type: String, required: true },
    attendance_pic_url: { type: String, required: true },
    registration_mode: {
      type: String,
      enum: ["upload", "live"],
      required: true,
    },
  },
  { strict: true, timestamps: true }
);

export type UserDoc = InferSchemaType<typeof userSchema>;
export const UserModel = model<UserDoc>("User", userSchema);
