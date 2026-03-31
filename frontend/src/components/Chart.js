import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js";
import { useState } from "react";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function Chart({ data }) {
  const [chartType, setChartType] = useState("pie");
  
  // Calculate category-wise expenses
  const categoryData = {};
  const monthlyData = {};

  data.forEach((t) => {
    if (t.type === "expense") {
      // Category data for pie chart
      categoryData[t.category] = (categoryData[t.category] || 0) + Number(t.amount);
      
      // Monthly data for bar chart
      const date = new Date(t.date);
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyData[monthYear] = (monthlyData[monthYear] || 0) + Number(t.amount);
    }
  });

  // Sort categories by amount (descending)
  const sortedCategories = Object.entries(categoryData)
    .sort((a, b) => b[1] - a[1])
    .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

  const labels = Object.keys(sortedCategories);
  const values = Object.values(sortedCategories);
  const totalExpense = values.reduce((a, b) => a + b, 0);

  // Vibrant color palette
  const colors = [
    "#FF6B6B", // Red
    "#4ECDC4", // Teal
    "#45B7D1", // Blue
    "#96CEB4", // Green
    "#FFEAA7", // Yellow
    "#DDA0DD", // Purple
    "#FF8C42", // Orange
    "#A8E6CF", // Mint
    "#FFD3B5", // Peach
    "#C7CEEA"  // Lavender
  ];

  // Pie chart data
  const pieChartData = {
    labels: labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 2,
        borderColor: "#fff",
        hoverOffset: 15,
      },
    ],
  };

  // Bar chart data (monthly trend)
  const monthlyLabels = Object.keys(monthlyData);
  const monthlyValues = Object.values(monthlyData);

  const barChartData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: "Monthly Expenses (₹)",
        data: monthlyValues,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
        borderRadius: 8,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
    ],
  };

  // Chart options with tooltips and percentages
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#fff",
          font: {
            size: 12,
            weight: "bold",
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw;
            const percentage = ((value / totalExpense) * 100).toFixed(1);
            return `${context.label}: ₹${value.toLocaleString()} (${percentage}%)`;
          },
        },
        backgroundColor: "rgba(0,0,0,0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#a78bfa",
        borderWidth: 2,
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1000,
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#fff",
          font: { size: 12, weight: "bold" },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `₹${context.raw.toLocaleString()}`;
          },
        },
        backgroundColor: "rgba(0,0,0,0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(255,255,255,0.1)",
        },
        ticks: {
          color: "#fff",
          callback: function (value) {
            return "₹" + value.toLocaleString();
          },
        },
        title: {
          display: true,
          text: "Amount (₹)",
          color: "#fff",
          font: { size: 12, weight: "bold" },
        },
      },
      x: {
        grid: {
          color: "rgba(255,255,255,0.1)",
        },
        ticks: {
          color: "#fff",
          maxRotation: 45,
          minRotation: 45,
        },
        title: {
          display: true,
          text: "Month",
          color: "#fff",
          font: { size: 12, weight: "bold" },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuart",
    },
  };

  // Calculate insights
  const topCategory = labels[0] || "None";
  const topAmount = values[0] || 0;
  const avgMonthlyExpense = monthlyValues.length ? 
    (totalExpense / monthlyValues.length).toFixed(0) : 0;

  // If no expense data
  if (totalExpense === 0) {
    return (
      <div style={styles.noDataContainer}>
        <div style={styles.noDataEmoji}>📊</div>
        <h3 style={styles.noDataTitle}>No Expense Data Yet</h3>
        <p style={styles.noDataText}>
          Add some expenses to see beautiful analytics and insights! 🚀
        </p>
        <div style={styles.noDataTip}>
          💡 Tip: Try adding expenses like Food, Travel, or Shopping
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Chart Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>📊 Spending Analytics</h2>
        <div style={styles.chartToggle}>
          <button
            onClick={() => setChartType("pie")}
            style={{
              ...styles.toggleButton,
              background: chartType === "pie" ? "#7c3aed" : "rgba(255,255,255,0.1)",
            }}
          >
            🥧 Pie Chart
          </button>
          <button
            onClick={() => setChartType("bar")}
            style={{
              ...styles.toggleButton,
              background: chartType === "bar" ? "#7c3aed" : "rgba(255,255,255,0.1)",
            }}
          >
            📊 Bar Chart
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={styles.summaryCards}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>💰</div>
          <div style={styles.summaryInfo}>
            <div style={styles.summaryLabel}>Total Expenses</div>
            <div style={styles.summaryValue}>₹{totalExpense.toLocaleString()}</div>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>🏆</div>
          <div style={styles.summaryInfo}>
            <div style={styles.summaryLabel}>Top Category</div>
            <div style={styles.summaryValue}>
              {topCategory} <span style={styles.summarySub}>₹{topAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>📅</div>
          <div style={styles.summaryInfo}>
            <div style={styles.summaryLabel}>Avg Monthly</div>
            <div style={styles.summaryValue}>₹{Number(avgMonthlyExpense).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Chart Display */}
      <div style={styles.chartContainer}>
        {chartType === "pie" ? (
          <Pie data={pieChartData} options={pieOptions} />
        ) : (
          <Bar data={barChartData} options={barOptions} />
        )}
      </div>

      {/* Category Breakdown */}
      {chartType === "pie" && labels.length > 0 && (
        <div style={styles.breakdown}>
          <h3 style={styles.breakdownTitle}>📋 Category Breakdown</h3>
          <div style={styles.categoryList}>
            {labels.map((category, index) => {
              const amount = values[index];
              const percentage = ((amount / totalExpense) * 100).toFixed(1);
              return (
                <div key={category} style={styles.categoryItem}>
                  <div style={styles.categoryLeft}>
                    <div
                      style={{
                        ...styles.categoryColor,
                        background: colors[index % colors.length],
                      }}
                    />
                    <span style={styles.categoryName}>{category}</span>
                  </div>
                  <div style={styles.categoryRight}>
                    <span style={styles.categoryAmount}>₹{amount.toLocaleString()}</span>
                    <span style={styles.categoryPercentage}>({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Monthly Insights */}
      {chartType === "bar" && monthlyLabels.length > 0 && (
        <div style={styles.insights}>
          <h3 style={styles.breakdownTitle}>📈 Monthly Insights</h3>
          <div style={styles.insightText}>
            {monthlyValues[monthlyValues.length - 1] > monthlyValues[0] ? (
              <span>📈 Your spending increased by {(((monthlyValues[monthlyValues.length - 1] - monthlyValues[0]) / monthlyValues[0]) * 100).toFixed(0)}% this month</span>
            ) : (
              <span>📉 Your spending decreased by {(((monthlyValues[0] - monthlyValues[monthlyValues.length - 1]) / monthlyValues[0]) * 100).toFixed(0)}% - Great job! 🎉</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    padding: "25px",
    marginTop: "20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    flexWrap: "wrap",
    gap: "15px",
  },
  title: {
    color: "#fff",
    fontSize: "1.5rem",
    margin: 0,
  },
  chartToggle: {
    display: "flex",
    gap: "10px",
  },
  toggleButton: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "bold",
    transition: "all 0.3s ease",
  },
  summaryCards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginBottom: "30px",
  },
  summaryCard: {
    background: "rgba(0,0,0,0.3)",
    borderRadius: "12px",
    padding: "15px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  summaryIcon: {
    fontSize: "2rem",
  },
  summaryInfo: {
    flex: 1,
  },
  summaryLabel: {
    color: "#aaa",
    fontSize: "0.8rem",
    textTransform: "uppercase",
    marginBottom: "5px",
  },
  summaryValue: {
    color: "#fff",
    fontSize: "1.3rem",
    fontWeight: "bold",
  },
  summarySub: {
    fontSize: "0.8rem",
    color: "#a78bfa",
    marginLeft: "5px",
  },
  chartContainer: {
    maxWidth: "500px",
    margin: "0 auto",
    padding: "20px",
  },
  breakdown: {
    marginTop: "30px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    paddingTop: "20px",
  },
  breakdownTitle: {
    color: "#fff",
    fontSize: "1.2rem",
    marginBottom: "15px",
  },
  categoryList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  categoryItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    background: "rgba(0,0,0,0.2)",
    borderRadius: "8px",
    transition: "transform 0.2s ease",
  },
  categoryLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  categoryColor: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
  },
  categoryName: {
    color: "#fff",
    fontWeight: "500",
  },
  categoryRight: {
    display: "flex",
    gap: "10px",
    alignItems: "baseline",
  },
  categoryAmount: {
    color: "#fff",
    fontWeight: "bold",
  },
  categoryPercentage: {
    color: "#a78bfa",
    fontSize: "0.8rem",
  },
  insights: {
    marginTop: "30px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    paddingTop: "20px",
  },
  insightText: {
    background: "rgba(147,51,234,0.2)",
    padding: "12px",
    borderRadius: "8px",
    color: "#fff",
    textAlign: "center",
    fontSize: "0.9rem",
  },
  noDataContainer: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    padding: "40px",
    textAlign: "center",
  },
  noDataEmoji: {
    fontSize: "4rem",
    marginBottom: "15px",
  },
  noDataTitle: {
    color: "#fff",
    fontSize: "1.5rem",
    marginBottom: "10px",
  },
  noDataText: {
    color: "#aaa",
    fontSize: "1rem",
    marginBottom: "15px",
  },
  noDataTip: {
    color: "#a78bfa",
    fontSize: "0.9rem",
    background: "rgba(147,51,234,0.1)",
    padding: "8px",
    borderRadius: "8px",
    display: "inline-block",
  },
};

export default Chart;