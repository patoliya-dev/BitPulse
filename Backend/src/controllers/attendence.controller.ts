import { Request, Response } from "express";
import moment from "moment";
import { UserDoc, UserModel } from "../models/user.model";
import { Attendance } from "../models/attendence.model";
import { AttendanceStatus, OFFICE_START_HOUR } from "../constant/app.constant";
import { TODAY } from "../utils/utils";

// POST /attendance
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

// GET /attendance?status=present
export const getUserAttendance = async (req: Request | any, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { status, fromDate, toDate } = req.query;
    const filter: any = { user: userId };

    // 🔹 Status filter
    if (status && typeof status === "string") {
      const statusLower = status.toLowerCase();
      if (
        !Object.values(AttendanceStatus).includes(
          statusLower as AttendanceStatus
        )
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid status" });
      }
      filter.status = statusLower as AttendanceStatus;
    }

    // 🔹 Date range filter
    if (fromDate || toDate) {
      filter.date = {};
      if (fromDate && typeof fromDate === "string") {
        filter.date.$gte = moment(fromDate, "YYYY-MM-DD")
          .startOf("day")
          .toDate();
      }
      if (toDate && typeof toDate === "string") {
        filter.date.$lte = moment(toDate, "YYYY-MM-DD").endOf("day").toDate();
      }
    }

    // 🔹 Fetch attendance with full user populated
    const attendanceList = await Attendance.find(filter)
      .populate("user", "first_name last_name") // only useful fields
      .sort({ date: -1 })
      .lean();

    // 🔹 Summarize sessions
    const summarized = attendanceList.map((att) => {
      let firstCheckIn: Date | null = null;
      let lastCheckOut: Date | null = null;
      const user = att.user as unknown as UserDoc;

      if (att.sessions && att.sessions.length > 0) {
        // sort sessions by checkIn
        const sortedSessions = att.sessions.sort(
          (a: any, b: any) =>
            new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime()
        );

        firstCheckIn = sortedSessions[0]?.checkIn || null;

        // last checkOut
        const withCheckOut = sortedSessions.filter((s: any) => s.checkOut);
        if (withCheckOut.length > 0) {
          lastCheckOut = withCheckOut[withCheckOut.length - 1].checkOut || null;
        }
      }

      return {
        id: att._id,
        name: `${user?.first_name || ""} ${user?.last_name || ""}`.trim(),
        date: att.date,
        status: att.status,
        checkIn: firstCheckIn,
        checkOut: lastCheckOut,
        sessions: att.sessions,
      };
    });

    return res.status(200).json({
      success: true,
      count: summarized.length,
      data: summarized,
    });
  } catch (err: any) {
    console.error("Error in getUserAttendance:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};
