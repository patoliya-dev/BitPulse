import { Request, Response } from "express";
import moment from "moment";
import { UserModel } from "../models/user.model";
import { Attendance } from "../models/attendence.model";
import { AttendanceStatus, OFFICE_START_HOUR } from "../constant/app.constant";
import { TODAY } from "../utils/utils";

export const createAttendance = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    // 1. Check user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 2. Find today's attendance
    let attendance = await Attendance.findOne({ user: userId, date: TODAY });

    if (!attendance) {
      attendance = new Attendance({
        user: userId,
        date: TODAY,
        status: AttendanceStatus.PRESENT,
        sessions: [],
      });
    }

    const now = new Date();
    const lastSession = attendance.sessions[attendance.sessions.length - 1];

    // 3. If no sessions yet OR last session is closed → Check-In
    if (!lastSession || lastSession.checkOut) {
      attendance.sessions.push({ checkIn: now });

      // Auto-set status: late if first check-in after office start
      if (moment(now).hour() >= OFFICE_START_HOUR) {
        attendance.status = AttendanceStatus.LATE;
      } else {
        attendance.status = AttendanceStatus.PRESENT;
      }

      await attendance.save();

      return res.status(201).json({
        success: true,
        action: "check-in",
        message: "Check-in recorded successfully",
        data: attendance,
      });
    }

    // 4. If last session is open → Check-Out
    if (!lastSession.checkOut) {
      lastSession.checkOut = now;
      await attendance.save();

      // Optional: calculate total worked hours using Moment.js
      const totalHours = attendance.sessions.reduce((acc, session) => {
        if (session.checkOut) {
          const start = moment(session.checkIn);
          const end = moment(session.checkOut);
          return acc + end.diff(start, "hours", true); // true = float
        }
        return acc;
      }, 0);

      return res.status(200).json({
        success: true,
        action: "check-out",
        message: "Check-out recorded successfully",
        totalHours,
        data: attendance,
      });
    }
  } catch (err: any) {
    console.error("Error in markAttendanceByFace:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};
