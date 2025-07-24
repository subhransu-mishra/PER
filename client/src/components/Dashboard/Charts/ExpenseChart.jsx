import React from 'react';
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
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

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

const ExpenseChart = ({ data, type = 'category' }) => {
  if (!data) return <div className="flex items-center justify-center h-64">Loading...</div>;

  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: type === 'category' ? 'Expenses by Category' : 
              type === 'monthly' ? 'Monthly Expense Trend' : 
              type === 'status' ? 'Expenses by Status' : 
              type === 'payment' ? 'Expenses by Payment Type' : 'Expense Overview',
      },
    },
    scales: type !== 'category-pie' && type !== 'status-pie' && type !== 'payment-pie' ? {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString();
          }
        }
      }
    } : undefined,
  };

  // Expenses by Category (Bar Chart)
  if (type === 'category') {
    const chartData = {
      labels: data.map(d => d._id),
      datasets: [
        {
          label: 'Expense Amount',
          data: data.map(d => d.totalAmount),
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(14, 165, 233, 0.8)',
            'rgba(34, 197, 94, 0.8)',
          ],
          borderColor: [
            'rgb(239, 68, 68)',
            'rgb(245, 158, 11)',
            'rgb(59, 130, 246)',
            'rgb(16, 185, 129)',
            'rgb(139, 92, 246)',
            'rgb(236, 72, 153)',
            'rgb(14, 165, 233)',
            'rgb(34, 197, 94)',
          ],
          borderWidth: 1,
        }
      ]
    };

    return (
      <div className="h-64">
        <Bar data={chartData} options={chartOptions} />
      </div>
    );
  }

  // Expenses by Category (Pie Chart)
  if (type === 'category-pie') {
    const chartData = {
      labels: data.map(d => d._id),
      datasets: [
        {
          data: data.map(d => d.totalAmount),
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(14, 165, 233, 0.8)',
            'rgba(34, 197, 94, 0.8)',
          ],
          borderColor: [
            'rgb(239, 68, 68)',
            'rgb(245, 158, 11)',
            'rgb(59, 130, 246)',
            'rgb(16, 185, 129)',
            'rgb(139, 92, 246)',
            'rgb(236, 72, 153)',
            'rgb(14, 165, 233)',
            'rgb(34, 197, 94)',
          ],
          borderWidth: 2,
        }
      ]
    };

    const pieOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        },
        title: {
          display: true,
          text: 'Expense Distribution by Category',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return `${context.label}: ₹${context.parsed.toLocaleString()} (${percentage}%)`;
            }
          }
        }
      },
    };

    return (
      <div className="h-64">
        <Pie data={chartData} options={pieOptions} />
      </div>
    );
  }

  // Monthly Expense Trend (Line Chart)
  if (type === 'monthly') {
    const chartData = {
      labels: data.map(d => `${getMonthName(d.month)} ${d.year}`),
      datasets: [
        {
          label: 'Expenses',
          data: data.map(d => d.totalAmount),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true,
        }
      ]
    };

    return (
      <div className="h-64 min-h-[220px] w-full overflow-x-auto p-2 sm:p-0">
        <Line data={chartData} options={chartOptions} />
      </div>
    );
  }

  // Expenses by Status (Bar Chart)
  if (type === 'status') {
    const statusColors = {
      pending: 'rgba(245, 158, 11, 0.8)',
      approved: 'rgba(16, 185, 129, 0.8)',
      rejected: 'rgba(239, 68, 68, 0.8)',
    };

    const chartData = {
      labels: data.map(d => d._id.charAt(0).toUpperCase() + d._id.slice(1)),
      datasets: [
        {
          label: 'Expense Amount',
          data: data.map(d => d.totalAmount),
          backgroundColor: data.map(d => statusColors[d._id] || 'rgba(107, 114, 128, 0.8)'),
          borderColor: data.map(d => statusColors[d._id]?.replace('0.8', '1') || 'rgb(107, 114, 128)'),
          borderWidth: 1,
        }
      ]
    };

    return (
      <div className="h-64">
        <Bar data={chartData} options={chartOptions} />
      </div>
    );
  }

  // Expenses by Payment Type (Pie Chart)
  if (type === 'payment-pie') {
    const paymentColors = {
      cash: 'rgba(34, 197, 94, 0.8)',
      card: 'rgba(59, 130, 246, 0.8)',
      upi: 'rgba(139, 92, 246, 0.8)',
      bank: 'rgba(245, 158, 11, 0.8)',
    };

    const chartData = {
      labels: data.map(d => d._id.toUpperCase()),
      datasets: [
        {
          data: data.map(d => d.totalAmount),
          backgroundColor: data.map(d => paymentColors[d._id] || 'rgba(107, 114, 128, 0.8)'),
          borderColor: data.map(d => paymentColors[d._id]?.replace('0.8', '1') || 'rgb(107, 114, 128)'),
          borderWidth: 2,
        }
      ]
    };

    const pieOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        },
        title: {
          display: true,
          text: 'Expense Distribution by Payment Type',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return `${context.label}: ₹${context.parsed.toLocaleString()} (${percentage}%)`;
            }
          }
        }
      },
    };

    return (
      <div className="h-64">
        <Pie data={chartData} options={pieOptions} />
      </div>
    );
  }

  return <div className="flex items-center justify-center h-64">Invalid chart type</div>;
};

export default ExpenseChart;
