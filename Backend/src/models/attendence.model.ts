import { Schema, model, Document, Types } from "mongoose";

// 🔹 TypeScript interface
export interface ISession {
  checkIn: Date;
  checkOut?: Date; // optional (if user hasn't checked out yet)
}

export interface IAttendance extends Document {
  user: Types.ObjectId; // Reference to User
  date: Date; // Normalized date (e.g., 2025-09-20 00:00:00)
  status: "present" | "absent" | "late";
  sessions: ISession[];
  createdAt: Date;
  updatedAt: Date;
}

// 🔹 Schema
const SessionSchema = new Schema<ISession>(
  {
    checkIn: { type: Date, required: true },
    checkOut: { type: Date },
  },
  { _id: false } // no need for separate _id inside sessions
);

const AttendanceSchema = new Schema<IAttendance>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["present", "absent", "late"],
      default: "present",
    },
    sessions: [SessionSchema],
  },
  { strict: true, timestamps: true }
);

// 🔹 Ensure unique attendance per user per day
AttendanceSchema.index({ user: 1, date: 1 }, { unique: true });

export const Attendance = model<IAttendance>("Attendance", AttendanceSchema);
