import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const RevenueChart = ({ data, type = "monthly" }) => {
  console.log("RevenueChart - Type:", type, "Data:", data);
  console.log("RevenueChart - Data type:", typeof data, "Is Array:", Array.isArray(data));
  
  if (data && Array.isArray(data)) {
    console.log("RevenueChart - Data length:", data.length);
    console.log("RevenueChart - First item:", data[0]);
  }

  if (!data || data === null || data === undefined) {
    console.log("RevenueChart - No data provided");
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-500">No data available</p>
          <p className="text-xs text-gray-400 mt-1">Chart type: {type}</p>
        </div>
      </div>
    );
  }

  if (Array.isArray(data) && data.length === 0) {
    console.log("RevenueChart - Empty data array");
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-500">No revenue data available</p>
        </div>
      </div>
    );
  }

  const getMonthName = (month) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months[month - 1];
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text:
          type === "monthly"
            ? "Monthly Revenue Trend"
            : type === "source"
            ? "Revenue by Source"
            : type === "status"
            ? "Revenue by Status"
            : "Revenue Overview",
      },
    },
    scales:
      type !== "source-pie" && type !== "status-pie"
        ? {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  return "₹" + value.toLocaleString();
                },
              },
            },
          }
        : undefined,
  };

  // Monthly Revenue Trend (Bar Chart)
  if (type === "monthly") {
    // Handle the data structure from API: {_id: {year, month}, totalAmount, count}
    const chartData = {
      labels: data.map((d) => `${getMonthName(d._id.month)} ${d._id.year}`),
      datasets: [
        {
          label: "Revenue Amount",
          data: data.map((d) => d.totalAmount),
          backgroundColor: "rgba(59, 130, 246, 0.8)",
          borderColor: "rgb(59, 130, 246)",
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    };

    return (
      <div className="h-64">
        <Bar data={chartData} options={chartOptions} />
      </div>
    );
  }

  // Revenue by Source (Bar Chart)
  if (type === "source") {
    const colors = [
      "rgba(59, 130, 246, 0.8)",
      "rgba(16, 185, 129, 0.8)",
      "rgba(245, 158, 11, 0.8)",
      "rgba(239, 68, 68, 0.8)",
      "rgba(139, 92, 246, 0.8)",
      "rgba(249, 115, 22, 0.8)",
      "rgba(6, 182, 212, 0.8)",
      "rgba(132, 204, 22, 0.8)",
    ];

    const borderColors = [
      "rgb(59, 130, 246)",
      "rgb(16, 185, 129)",
      "rgb(245, 158, 11)",
      "rgb(239, 68, 68)",
      "rgb(139, 92, 246)",
      "rgb(249, 115, 22)",
      "rgb(6, 182, 212)",
      "rgb(132, 204, 22)",
    ];

    const chartData = {
      labels: data.map((d) => {
        const source = d._id || 'Unknown';
        return source.charAt(0).toUpperCase() + source.slice(1);
      }),
      datasets: [
        {
          label: "Revenue Amount",
          data: data.map((d) => d.totalAmount),
          backgroundColor: data.map((_, index) => colors[index % colors.length]),
          borderColor: data.map((_, index) => borderColors[index % borderColors.length]),
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    };

    return (
      <div className="h-64">
        <Bar data={chartData} options={chartOptions} />
      </div>
    );
  }

  // Revenue by Source/Sector (Pie Chart)
  if (type === "source-pie") {
    // Enhanced color palette for better visualization
    const sectorColors = [
      "#3B82F6", // Blue
      "#10B981", // Green
      "#F59E0B", // Amber
      "#EF4444", // Red
      "#8B5CF6", // Purple
      "#F97316", // Orange
      "#06B6D4", // Cyan
      "#84CC16", // Lime
      "#EC4899", // Pink
      "#6B7280", // Gray
    ];

    const chartData = {
      labels: data.map((d) => d._id.charAt(0).toUpperCase() + d._id.slice(1)),
      datasets: [
        {
          data: data.map((d) => d.totalAmount),
          backgroundColor: data.map(
            (_, index) => sectorColors[index % sectorColors.length] + "CC"
          ),
          borderColor: data.map(
            (_, index) => sectorColors[index % sectorColors.length]
          ),
          borderWidth: 2,
          hoverOffset: 15,
        },
      ],
    };

    const pieOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: {
            padding: 20,
            usePointStyle: true,
            pointStyle: "circle",
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce(
                (acc, curr) => acc + curr,
                0
              );
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ₹${value.toLocaleString()} (${percentage}%)`;
            },
          },
        },
        title: {
          display: true,
          text: "Revenue Distribution by Source",
          font: {
            size: 16,
            weight: "bold",
          },
          padding: {
            top: 10,
            bottom: 30,
          },
        },
      },
      animation: {
        animateScale: true,
        animateRotate: true,
      },
    };

    return (
      <div className="h-[400px] relative">
        <Pie data={chartData} options={pieOptions} />
        {data.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>
              Total Revenue: ₹
              {data
                .reduce((sum, item) => sum + item.totalAmount, 0)
                .toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              From {data.length} different source{data.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Revenue by Status (Bar Chart)
  if (type === "status") {
    const statusColors = {
      pending: "rgba(245, 158, 11, 0.8)",
      received: "rgba(16, 185, 129, 0.8)",
      overdue: "rgba(239, 68, 68, 0.8)",
      paid: "rgba(16, 185, 129, 0.8)",
      unpaid: "rgba(239, 68, 68, 0.8)",
      partial: "rgba(245, 158, 11, 0.8)",
    };

    const statusBorderColors = {
      pending: "rgb(245, 158, 11)",
      received: "rgb(16, 185, 129)",
      overdue: "rgb(239, 68, 68)",
      paid: "rgb(16, 185, 129)",
      unpaid: "rgb(239, 68, 68)",
      partial: "rgb(245, 158, 11)",
    };

    const chartData = {
      labels: data.map((d) => {
        const status = d._id || 'Unknown';
        return status.charAt(0).toUpperCase() + status.slice(1);
      }),
      datasets: [
        {
          label: "Revenue Amount",
          data: data.map((d) => d.totalAmount),
          backgroundColor: data.map(
            (d) => statusColors[d._id] || "rgba(107, 114, 128, 0.8)"
          ),
          borderColor: data.map(
            (d) => statusBorderColors[d._id] || "rgb(107, 114, 128)"
          ),
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    };

    return (
      <div className="h-64">
        <Bar data={chartData} options={chartOptions} />
      </div>
    );
  }

  // Revenue by Payment Method (Bar Chart)
  if (type === "payment") {
    const paymentColors = {
      cash: "rgba(34, 197, 94, 0.8)",
      bank: "rgba(59, 130, 246, 0.8)",
      cheque: "rgba(245, 158, 11, 0.8)",
      online: "rgba(139, 92, 246, 0.8)",
      card: "rgba(239, 68, 68, 0.8)",
    };

    const paymentBorderColors = {
      cash: "rgb(34, 197, 94)",
      bank: "rgb(59, 130, 246)",
      cheque: "rgb(245, 158, 11)",
      online: "rgb(139, 92, 246)",
      card: "rgb(239, 68, 68)",
    };

    const chartData = {
      labels: data.map((d) => {
        const method = d._id || 'Unknown';
        return method.charAt(0).toUpperCase() + method.slice(1);
      }),
      datasets: [
        {
          label: "Revenue Amount",
          data: data.map((d) => d.totalAmount),
          backgroundColor: data.map(
            (d) => paymentColors[d._id] || "rgba(107, 114, 128, 0.8)"
          ),
          borderColor: data.map(
            (d) => paymentBorderColors[d._id] || "rgb(107, 114, 128)"
          ),
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    };

    return (
      <div className="h-64">
        <Bar data={chartData} options={chartOptions} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-64">
      Invalid chart type
    </div>
  );
};

export default RevenueChart;
