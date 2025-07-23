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
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const CashflowChart = ({ data, type = 'comparison' }) => {
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
        text: type === 'comparison' ? 'Monthly Revenue vs Expenses' : 
              type === 'netflow' ? 'Net Cashflow Trend' : 'Cashflow Overview',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString();
          }
        }
      }
    },
  };

  // Revenue vs Expenses Comparison (Bar Chart)
  if (type === 'comparison') {
    const chartData = {
      labels: data.map(d => `${getMonthName(d.month)} ${d.year}`),
      datasets: [
        {
          label: 'Revenue',
          data: data.map(d => d.revenue),
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 1,
        },
        {
          label: 'Expenses',
          data: data.map(d => d.expenses),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 1,
        },
        {
          label: 'Petty Cash',
          data: data.map(d => d.pettyCash),
          backgroundColor: 'rgba(245, 158, 11, 0.8)',
          borderColor: 'rgb(245, 158, 11)',
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

  // Net Cashflow Trend (Line Chart)
  if (type === 'netflow') {
    const chartData = {
      labels: data.map(d => `${getMonthName(d.month)} ${d.year}`),
      datasets: [
        {
          label: 'Net Cashflow',
          data: data.map(d => d.netCashflow),
          borderColor: data.map(d => d.netCashflow >= 0 ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)'),
          backgroundColor: data.map(d => d.netCashflow >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'),
          tension: 0.4,
          fill: true,
          pointBackgroundColor: data.map(d => d.netCashflow >= 0 ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)'),
          pointBorderColor: data.map(d => d.netCashflow >= 0 ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)'),
          pointRadius: 5,
        }
      ]
    };

    const netflowOptions = {
      ...chartOptions,
      scales: {
        y: {
          ticks: {
            callback: function(value) {
              return '₹' + value.toLocaleString();
            }
          }
        }
      },
      plugins: {
        ...chartOptions.plugins,
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.parsed.y;
              const status = value >= 0 ? 'Profit' : 'Loss';
              return `${context.dataset.label}: ₹${Math.abs(value).toLocaleString()} (${status})`;
            }
          }
        }
      }
    };

    return (
      <div className="h-64">
        <Line data={chartData} options={netflowOptions} />
      </div>
    );
  }

  // Stacked Revenue vs Total Expenses (Bar Chart)
  if (type === 'stacked') {
    const chartData = {
      labels: data.map(d => `${getMonthName(d.month)} ${d.year}`),
      datasets: [
        {
          label: 'Revenue',
          data: data.map(d => d.revenue),
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 1,
        },
        {
          label: 'Total Expenses',
          data: data.map(d => d.totalExpenses),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 1,
        }
      ]
    };

    const stackedOptions = {
      ...chartOptions,
      plugins: {
        ...chartOptions.plugins,
        title: {
          display: true,
          text: 'Revenue vs Total Expenses (Stacked)',
        },
      },
    };

    return (
      <div className="h-64">
        <Bar data={chartData} options={stackedOptions} />
      </div>
    );
  }

  return <div className="flex items-center justify-center h-64">Invalid chart type</div>;
};

export default CashflowChart;
