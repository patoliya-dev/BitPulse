import React, { useState, useMemo } from "react";
import DataTable from "react-data-table-component";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Attendence = () => {
  const [filter, setFilter] = useState("daily");

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
    ],
    []
  );

  const filteredData = useMemo(() => {
    if (filter === "daily") {
      const today = new Date().toISOString().split("T")[0];
      return attendanceData.filter((item) => item.date === today);
    } else if (filter === "weekly") {
      const today = new Date();
      const weekStart = new Date(
        today.setDate(today.getDate() - today.getDay())
      );
      const weekEnd = new Date(
        today.setDate(today.getDate() - today.getDay() + 6)
      );
      return attendanceData.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= weekStart && itemDate <= weekEnd;
      });
    }
    return attendanceData;
  }, [filter, attendanceData]);

  const columns = [
    { name: "Date", selector: (row) => row.date, sortable: true },
    { name: "Name", selector: (row) => row.name, sortable: true },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <span
          className={
            row.status === "Present"
              ? "text-green-600 font-semibold"
              : "text-red-600 font-semibold"
          }
        >
          {row.status}
        </span>
      ),
    },
    { name: "Check In", selector: (row) => row.checkIn },
    { name: "Check Out", selector: (row) => row.checkOut },
  ];

  // Custom styles for larger font
  const customStyles = {
    header: {
      style: {
        fontSize: "24px",
      },
    },
    headRow: {
      style: {
        fontSize: "18px",
      },
    },
    rows: {
      style: {
        fontSize: "18px",
      },
    },
    pagination: {
      style: {
        fontSize: "16px",
      },
    },
  };

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

    // Use autoTable
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("attendance_report.pdf");
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Attendance</h1>

      {/* Filters & Export */}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded ${
              filter === "daily"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setFilter("daily")}
          >
            Daily
          </button>
          <button
            className={`px-4 py-2 rounded ${
              filter === "weekly"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setFilter("weekly")}
          >
            Weekly
          </button>
        </div>

        <div className="flex space-x-2">
          <CSVLink
            data={filteredData}
            filename={"attendance_report.csv"}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Export CSV
          </CSVLink>
          <button
            onClick={exportPDF}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredData}
        pagination
        highlightOnHover
        striped
        responsive
        dense
        defaultSortFieldId={1}
        customStyles={customStyles}
      />
    </div>
  );
};

export default Attendence;
