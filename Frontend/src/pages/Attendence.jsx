import React, { useState, useMemo, useEffect } from "react";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Search,
  Calendar,
  Download,
  FileText,
  ChevronLeft,
  ChevronRight,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
  TrendingUp,
  Eye,
} from "lucide-react";
import api from "../api";

const Attendence = () => {
  const [filter, setFilter] = useState("daily");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const itemsPerPage = 5;

  const attendanceData = useMemo(
    () => [
      {
        id: 1,
        date: "2025-09-20",
        name: "John Doe",
        status: "Present",
        checkIn: "09:00 AM",
        checkOut: "05:00 PM",
      },
      {
        id: 2,
        date: "2025-09-20",
        name: "Jane Smith",
        status: "Absent",
        checkIn: "-",
        checkOut: "-",
      },
      {
        id: 3,
        date: "2025-09-19",
        name: "John Doe",
        status: "Present",
        checkIn: "09:05 AM",
        checkOut: "05:00 PM",
      },
      {
        id: 4,
        date: "2025-09-20",
        name: "Alice Johnson",
        status: "Late",
        checkIn: "09:30 AM",
        checkOut: "05:00 PM",
      },
      {
        id: 5,
        date: "2025-09-19",
        name: "Bob Wilson",
        status: "Present",
        checkIn: "08:55 AM",
        checkOut: "05:05 PM",
      },
      {
        id: 6,
        date: "2025-09-18",
        name: "Carol Davis",
        status: "Absent",
        checkIn: "-",
        checkOut: "-",
      },
      {
        id: 7,
        date: "2025-09-20",
        name: "David Brown",
        status: "Present",
        checkIn: "09:10 AM",
        checkOut: "05:15 PM",
      },
      {
        id: 8,
        date: "2025-09-19",
        name: "Emma Wilson",
        status: "Late",
        checkIn: "09:25 AM",
        checkOut: "05:00 PM",
      },
      {
        id: 9,
        date: "2025-09-18",
        name: "Frank Miller",
        status: "Present",
        checkIn: "08:45 AM",
        checkOut: "04:55 PM",
      },
      {
        id: 10,
        date: "2025-09-17",
        name: "Grace Taylor",
        status: "Absent",
        checkIn: "-",
        checkOut: "-",
      },
      {
        id: 11,
        date: "2025-09-20",
        name: "Henry Clark",
        status: "Present",
        checkIn: "09:02 AM",
        checkOut: "05:08 PM",
      },
      {
        id: 12,
        date: "2025-09-19",
        name: "Ivy Rodriguez",
        status: "Present",
        checkIn: "08:58 AM",
        checkOut: "05:02 PM",
      },
      {
        id: 13,
        date: "2025-09-18",
        name: "Jack Anderson",
        status: "Late",
        checkIn: "09:40 AM",
        checkOut: "05:00 PM",
      },
      {
        id: 14,
        date: "2025-09-17",
        name: "Kate Phillips",
        status: "Present",
        checkIn: "09:15 AM",
        checkOut: "05:20 PM",
      },
      {
        id: 15,
        date: "2025-09-16",
        name: "Liam Garcia",
        status: "Absent",
        checkIn: "-",
        checkOut: "-",
      },
      {
        id: 16,
        date: "2025-09-20",
        name: "Maya Singh",
        status: "Present",
        checkIn: "08:50 AM",
        checkOut: "04:58 PM",
      },
      {
        id: 17,
        date: "2025-09-19",
        name: "Noah Thompson",
        status: "Late",
        checkIn: "09:35 AM",
        checkOut: "05:05 PM",
      },
      {
        id: 18,
        date: "2025-09-18",
        name: "Olivia Lee",
        status: "Present",
        checkIn: "09:08 AM",
        checkOut: "05:12 PM",
      },
      {
        id: 19,
        date: "2025-09-17",
        name: "Paul Martinez",
        status: "Absent",
        checkIn: "-",
        checkOut: "-",
      },
      {
        id: 20,
        date: "2025-09-16",
        name: "Quinn Cooper",
        status: "Present",
        checkIn: "09:03 AM",
        checkOut: "05:07 PM",
      },
    ],
    []
  );
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async() => {
      const attendence = await api.get("/attendence/report");
      console.log("object", attendence)
      setUser(attendence?.data?.data?.[0] || null);
    })();
  }, []);

  const filteredData = useMemo(() => {
    let filtered = attendanceData;

    if (filter === "daily") {
      const today = new Date().toISOString().split("T")[0];
      filtered = attendanceData.filter((item) => item.date === today);
    } else if (filter === "weekly") {
      const today = new Date();
      const weekStart = new Date(
        today.setDate(today.getDate() - today.getDay())
      );
      const weekEnd = new Date(
        today.setDate(today.getDate() - today.getDay() + 6)
      );
      filtered = attendanceData.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= weekStart && itemDate <= itemDate;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "date") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [filter, attendanceData, searchTerm, sortField, sortDirection]);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredData.length;
    const present = filteredData.filter(
      (item) => item.status === "Present"
    ).length;
    const absent = filteredData.filter(
      (item) => item.status === "Absent"
    ).length;
    const late = filteredData.filter((item) => item.status === "Late").length;

    return { total, present, absent, late };
  }, [filteredData]);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Attendance Report", 20, 10);

    const tableColumn = ["Date", "Name", "Status", "Check In", "Check Out"];
    const tableRows = filteredData.map((item) => [
      item.date,
      item.name,
      item.status,
      item.checkIn,
      item.checkOut,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("attendance_report.pdf");
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Present":
        return <CheckCircle className="h-4 w-4" />;
      case "Absent":
        return <XCircle className="h-4 w-4" />;
      case "Late":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Present":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "Absent":
        return "bg-rose-50 text-rose-700 border border-rose-200";
      case "Late":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Attendance Management
              </h1>
              <p className="text-gray-500 mt-1">
                Monitor and track employee attendance with real-time insights
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Total
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Present
                </p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">
                  {stats.present}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Absent
                </p>
                <p className="text-3xl font-bold text-rose-600 mt-1">
                  {stats.absent}
                </p>
              </div>
              <div className="p-3 bg-rose-100 rounded-xl">
                <XCircle className="h-6 w-6 text-rose-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Attendance Rate
                </p>
                <p className="text-3xl font-bold text-indigo-600 mt-1">
                  {stats.total > 0
                    ? Math.round((stats.present / stats.total) * 100)
                    : 0}
                  %
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
          <div className="flex flex-col xl:flex-row gap-6 justify-between">
            {/* Left Side - Search & Filters */}
            <div className="flex flex-col lg:flex-row gap-4 flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search employees or status..."
                  className="pl-11 pr-4 py-3 w-full lg:w-80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <button
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                    filter === "daily"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                  }`}
                  onClick={() => setFilter("daily")}
                >
                  <Calendar className="h-4 w-4" />
                  Daily
                </button>
                <button
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                    filter === "weekly"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                  }`}
                  onClick={() => setFilter("weekly")}
                >
                  <Calendar className="h-4 w-4" />
                  Weekly
                </button>
              </div>
            </div>

            {/* Right Side - Export Actions */}
            <div className="flex gap-3">
              <CSVLink
                data={filteredData}
                filename={"attendance_report.csv"}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 font-semibold"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </CSVLink>
              <button
                onClick={exportPDF}
                className="px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl hover:from-rose-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 font-semibold"
              >
                <FileText className="h-4 w-4" />
                Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Attendance Records
              </h3>
              <span className="ml-auto text-sm text-gray-500">
                {filteredData.length}{" "}
                {filteredData.length === 1 ? "record" : "records"}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
                <tr>
                  <th
                    className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center gap-2">
                      Date
                      <Filter className="h-4 w-4 opacity-50" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-2">
                      Employee
                      <Filter className="h-4 w-4 opacity-50" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      <Filter className="h-4 w-4 opacity-50" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Check Out
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentData.map((row, index) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group"
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {new Date(row.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(row.date).toLocaleDateString("en-US", {
                              weekday: "short",
                            })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          {row.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {row.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Employee ID: {row.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold ${getStatusColor(
                          row.status
                        )}`}
                      >
                        {getStatusIcon(row.status)}
                        {row.status}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-mono font-medium text-gray-900">
                          {row.checkIn}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-mono font-medium text-gray-900">
                          {row.checkOut}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-5 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 font-medium">
                  Showing{" "}
                  <span className="font-bold text-gray-900">
                    {startIndex + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-bold text-gray-900">
                    {Math.min(endIndex, filteredData.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-gray-900">
                    {filteredData.length}
                  </span>{" "}
                  results
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                            currentPage === page
                              ? "bg-blue-600 text-white shadow-lg"
                              : "text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendence;
