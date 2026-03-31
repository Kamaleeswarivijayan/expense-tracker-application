import { useEffect, useState } from "react";
import Chart from "./components/Chart";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const API = "https://expense-tracker-application-u7lo.onrender.com/api/transactions";


function App() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("");
  const [goal, setGoal] = useState(50000);
  const [monthlyBudget, setMonthlyBudget] = useState(5000);
  const [viewMode, setViewMode] = useState("all"); // all, income, expense

  const [form, setForm] = useState({
    title: "",
    amount: "",
    type: "income",
    category: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  // LOAD DATA
  const loadData = async () => {
    const res = await fetch(API);
    const data = await res.json();
    setTransactions(data);
  };

  // ADD
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount || !form.category) {
      alert("Please fill all fields!");
      return;
    }

    await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ...form, amount: Number(form.amount) })
    });

    setForm({ title: "", amount: "", type: "income", category: "" });
    loadData();
  };

  // DELETE
  const deleteTransaction = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    await fetch(`${API}/${id}`, { method: "DELETE" });
    loadData();
  };

  // 🔍 FILTER & VIEW MODE
  const categoryFiltered = filter
    ? transactions.filter((t) => t.category === filter)
    : transactions;
    
  const viewFiltered = viewMode === "all" 
    ? categoryFiltered 
    : categoryFiltered.filter(t => t.type === viewMode);

  // 💰 BALANCE & SUMMARY
  const getBalance = () => {
    let income = 0;
    let expense = 0;

    transactions.forEach((t) => {
      if (t.type === "income") income += Number(t.amount);
      else expense += Number(t.amount);
    });

    return { income, expense, balance: income - expense };
  };

  const { income, expense, balance } = getBalance();
  const savings = balance;
  const progress = goal ? ((savings / goal) * 100).toFixed(1) : 0;
  const budgetUsed = ((expense / monthlyBudget) * 100).toFixed(1);

  // 🧠 SMART INSIGHTS
  const getInsights = () => {
    if (transactions.length === 0) return "✨ Add transactions to get insights!";
    
    const categoryMap = {};
    transactions.forEach((t) => {
      if (t.type === "expense") {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + Number(t.amount);
      }
    });
    
    const maxCategory = Object.keys(categoryMap).reduce((a, b) =>
      categoryMap[a] > categoryMap[b] ? a : b, Object.keys(categoryMap)[0]
    );
    
    const avgExpense = (expense / transactions.filter(t => t.type === "expense").length).toFixed(0);
    
    if (expense > monthlyBudget) {
      return `⚠️ You're ${budgetUsed}% over budget! Reduce ${maxCategory} spending.`;
    } else if (savings > goal * 0.5) {
      return `🎉 Amazing! You're ${progress}% to your goal! Keep going!`;
    } else {
      return `💡 Tip: You spend most on ${maxCategory} (₹${categoryMap[maxCategory]}). Try reducing it by 20% this month.`;
    }
  };

  // 🤖 AUTO CATEGORY SUGGESTION
  const suggestCategory = (title) => {
    const text = title.toLowerCase();
    const suggestions = {
      food: "Food", pizza: "Food", lunch: "Food", dinner: "Food", restaurant: "Food",
      uber: "Travel", taxi: "Travel", bus: "Travel", flight: "Travel", train: "Travel",
      salary: "Income", freelance: "Income", bonus: "Income",
      movie: "Entertainment", netflix: "Entertainment", spotify: "Entertainment",
      shopping: "Shopping", amazon: "Shopping", flipkart: "Shopping",
      rent: "Housing", electricity: "Housing", bill: "Housing"
    };
    
    for (const [key, value] of Object.entries(suggestions)) {
      if (text.includes(key)) return value;
    }
    return "";
  };

  // 📊 MONTHLY COMPARISON
  const getMonthlyComparison = () => {
    const months = {};
    transactions.forEach(t => {
      const month = new Date(t.date).toLocaleString('default', { month: 'short' });
      if (!months[month]) months[month] = { income: 0, expense: 0 };
      if (t.type === "income") months[month].income += Number(t.amount);
      else months[month].expense += Number(t.amount);
    });
    return months;
  };

  // 📁 EXPORT EXCEL
  const exportToExcel = () => {
    const exportData = transactions.map(t => ({
      Title: t.title,
      Amount: `₹${t.amount}`,
      Type: t.type.toUpperCase(),
      Category: t.category,
      Date: new Date(t.date).toLocaleDateString()
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const file = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(file, `expenses_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // 📈 STATISTICS
  const topCategory = () => {
    const catMap = {};
    transactions.filter(t => t.type === "expense").forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + Number(t.amount);
    });
    const top = Object.entries(catMap).sort((a,b) => b[1] - a[1])[0];
    return top ? { name: top[0], amount: top[1] } : { name: "None", amount: 0 };
  };

  const monthlyComparison = getMonthlyComparison();
  const topSpend = topCategory();

  return (
    <div style={styles.container}>
      {/* Animated Background */}
      <div style={styles.animatedBg}>
        <div style={styles.gradient1}></div>
        <div style={styles.gradient2}></div>
        <div style={styles.gradient3}></div>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            <span style={styles.emojiFloat}>💰</span> 
            Expense Tracker Pro
            <span style={styles.emojiFloat}>📊</span>
          </h1>
          <button onClick={exportToExcel} style={styles.excelButton}>
            📁 Export Excel
          </button>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={{...styles.statCard, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"}}>
            <div style={styles.statIcon}>💰</div>
            <div style={styles.statLabel}>Balance</div>
            <div style={styles.statValue}>₹{balance.toLocaleString()}</div>
            <div style={styles.statTrend}>+{((balance / (income || 1)) * 100).toFixed(0)}%</div>
          </div>
          
          <div style={{...styles.statCard, background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"}}>
            <div style={styles.statIcon}>📈</div>
            <div style={styles.statLabel}>Income</div>
            <div style={styles.statValue}>₹{income.toLocaleString()}</div>
          </div>
          
          <div style={{...styles.statCard, background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"}}>
            <div style={styles.statIcon}>📉</div>
            <div style={styles.statLabel}>Expense</div>
            <div style={styles.statValue}>₹{expense.toLocaleString()}</div>
          </div>
        </div>

        {/* Smart Insights Alert */}
        <div style={styles.insightCard}>
          <div style={styles.insightIcon}>🧠</div>
          <div style={styles.insightText}>{getInsights()}</div>
        </div>

        {/* Goals & Budget Section */}
        <div style={styles.goalsContainer}>
          <div style={styles.goalCard}>
            <h3>🎯 Savings Goal</h3>
            <div style={styles.progressBar}>
              <div style={{...styles.progressFill, width: `${Math.min(progress, 100)}%`}}></div>
            </div>
            <div style={styles.goalStats}>
              <span>₹{savings.toLocaleString()} / ₹{goal.toLocaleString()}</span>
              <span style={{color: progress >= 100 ? '#4ade80' : '#fbbf24'}}>{progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="200000"
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value))}
              style={styles.rangeInput}
            />
          </div>
          
          <div style={styles.budgetCard}>
            <h3>🚨 Monthly Budget</h3>
            <div style={styles.progressBar}>
              <div style={{...styles.progressFill, width: `${Math.min(budgetUsed, 100)}%`, background: budgetUsed > 100 ? '#ef4444' : '#22c55e'}}></div>
            </div>
            <div style={styles.goalStats}>
              <span>₹{expense.toLocaleString()} / ₹{monthlyBudget.toLocaleString()}</span>
              <span style={{color: budgetUsed > 100 ? '#ef4444' : '#4ade80'}}>{budgetUsed}%</span>
            </div>
            <input
              type="range"
              min="1000"
              max="20000"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(Number(e.target.value))}
              style={styles.rangeInput}
            />
          </div>
        </div>

        {/* Add Transaction Form */}
        <div style={styles.formSection}>
          <h2 style={styles.sectionTitle}>✨ Add New Transaction</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              style={styles.input}
              placeholder="📝 Title (e.g., Pizza, Uber, Salary)"
              value={form.title}
              onChange={(e) => {
                const value = e.target.value;
                setForm({
                  ...form,
                  title: value,
                  category: suggestCategory(value) || form.category
                });
              }}
              required
            />
            <input
              style={styles.input}
              type="number"
              placeholder="💰 Amount"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
            <select
              style={styles.select}
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="income">📈 Income</option>
              <option value="expense">📉 Expense</option>
            </select>
            <input
              style={styles.input}
              placeholder="🏷️ Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            />
            <button type="submit" style={styles.addButton}>
              ➕ Add Transaction
            </button>
          </form>
        </div>

        {/* Filters & Transactions */}
        <div style={styles.listSection}>
          <div style={styles.listHeader}>
            <h2 style={styles.sectionTitle}>📋 Transactions</h2>
            <div style={styles.filterGroup}>
              <select style={styles.filterSelect} onChange={(e) => setFilter(e.target.value)}>
                <option value="">All Categories</option>
                <option value="Food">🍔 Food</option>
                <option value="Travel">✈️ Travel</option>
                <option value="Shopping">🛍️ Shopping</option>
                <option value="Entertainment">🎬 Entertainment</option>
                <option value="Housing">🏠 Housing</option>
                <option value="Income">💼 Income</option>
              </select>
              <div style={styles.viewButtons}>
                <button onClick={() => setViewMode("all")} style={{...styles.viewButton, background: viewMode === "all" ? "#7c3aed" : "rgba(255,255,255,0.1)"}}>All</button>
                <button onClick={() => setViewMode("income")} style={{...styles.viewButton, background: viewMode === "income" ? "#22c55e" : "rgba(255,255,255,0.1)"}}>Income</button>
                <button onClick={() => setViewMode("expense")} style={{...styles.viewButton, background: viewMode === "expense" ? "#ef4444" : "rgba(255,255,255,0.1)"}}>Expense</button>
              </div>
            </div>
          </div>

          <ul style={styles.list}>
            {viewFiltered.length === 0 ? (
              <div style={styles.emptyState}>
                <span style={styles.emptyEmoji}>📭</span>
                <p>No transactions found. Add your first one! 🚀</p>
              </div>
            ) : (
              viewFiltered.map((t, index) => (
                <li key={t._id} style={{...styles.listItem, animationDelay: `${index * 0.05}s`}}>
                  <div style={styles.transactionInfo}>
                    <span style={styles.transactionTitle}>{t.title}</span>
                    <span style={styles.transactionCategory}>
                      {t.type === "income" ? "📈" : "📉"} {t.category}
                    </span>
                    <span style={styles.transactionDate}>
                      {new Date(t.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={styles.transactionAmount}>
                    <span style={t.type === "income" ? styles.incomeAmount : styles.expenseAmount}>
                      {t.type === "income" ? "+" : "-"} ₹{Number(t.amount).toLocaleString()}
                    </span>
                    <button onClick={() => deleteTransaction(t._id)} style={styles.deleteButton}>
                      🗑️
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Stats & Chart */}
        {transactions.length > 0 && (
          <>
            <div style={styles.statsInsights}>
              <div style={styles.statsCard}>
                <h3>🏆 Top Spending Category</h3>
                <p style={styles.topCategory}>{topSpend.name}</p>
                <p style={styles.topAmount}>₹{topSpend.amount.toLocaleString()}</p>
              </div>
              <div style={styles.statsCard}>
                <h3>📊 Monthly Breakdown</h3>
                {Object.entries(monthlyComparison).slice(-3).map(([month, data]) => (
                  <div key={month} style={styles.monthStat}>
                    <span>{month}</span>
                    <span style={{color: '#4ade80'}}>+₹{data.income}</span>
                    <span style={{color: '#f87171'}}>-₹{data.expense}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={styles.chartSection}>
              <h2 style={styles.sectionTitle}>📊 Spending Analytics</h2>
              <Chart data={transactions} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Professional Dark Theme Styles
const styles = {
  container: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Segoe UI', 'Poppins', system-ui, sans-serif"
  },
  
  animatedBg: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)"
  },
  
  gradient1: {
    position: "absolute",
    top: "10%",
    left: "-20%",
    width: "80%",
    height: "80%",
    background: "radial-gradient(circle, rgba(147,51,234,0.4) 0%, transparent 70%)",
    borderRadius: "50%",
    animation: "float1 20s ease-in-out infinite"
  },
  
  gradient2: {
    position: "absolute",
    bottom: "10%",
    right: "-20%",
    width: "70%",
    height: "70%",
    background: "radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)",
    borderRadius: "50%",
    animation: "float2 25s ease-in-out infinite"
  },
  
  gradient3: {
    position: "absolute",
    top: "40%",
    left: "30%",
    width: "60%",
    height: "60%",
    background: "radial-gradient(circle, rgba(34,197,94,0.2) 0%, transparent 70%)",
    borderRadius: "50%",
    animation: "float3 18s ease-in-out infinite"
  },
  
  content: {
    position: "relative",
    zIndex: 1,
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "30px"
  },
  
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
    flexWrap: "wrap",
    gap: "20px"
  },
  
  title: {
    color: "#fff",
    fontSize: "2.5rem",
    background: "linear-gradient(135deg, #fff 0%, #a78bfa 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    animation: "titleGlow 3s ease-in-out infinite"
  },
  
  emojiFloat: {
    display: "inline-block",
    animation: "floatEmoji 3s ease-in-out infinite"
  },
  
  excelButton: {
    padding: "12px 24px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "1rem",
    transition: "all 0.3s ease"
  },
  
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginBottom: "30px"
  },
  
  statCard: {
    padding: "25px",
    borderRadius: "20px",
    backdropFilter: "blur(10px)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    transition: "transform 0.3s ease",
    color: "#fff"
  },
  
  statIcon: {
    fontSize: "2rem",
    marginBottom: "10px"
  },
  
  statLabel: {
    fontSize: "0.9rem",
    opacity: 0.9,
    textTransform: "uppercase"
  },
  
  statValue: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginTop: "10px"
  },
  
  statTrend: {
    fontSize: "0.8rem",
    marginTop: "10px",
    opacity: 0.8
  },
  
  insightCard: {
    background: "rgba(147,51,234,0.2)",
    backdropFilter: "blur(10px)",
    borderRadius: "15px",
    padding: "20px",
    marginBottom: "30px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    border: "1px solid rgba(147,51,234,0.3)"
  },
  
  insightIcon: {
    fontSize: "2rem"
  },
  
  insightText: {
    color: "#fff",
    fontSize: "1.1rem",
    flex: 1
  },
  
  goalsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
    marginBottom: "30px"
  },
  
  goalCard: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(10px)",
    borderRadius: "15px",
    padding: "20px",
    color: "#fff"
  },
  
  budgetCard: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(10px)",
    borderRadius: "15px",
    padding: "20px",
    color: "#fff"
  },
  
  progressBar: {
    background: "rgba(255,255,255,0.2)",
    borderRadius: "10px",
    height: "10px",
    margin: "15px 0",
    overflow: "hidden"
  },
  
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #a78bfa, #7c3aed)",
    borderRadius: "10px",
    transition: "width 0.5s ease"
  },
  
  goalStats: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.9rem",
    marginBottom: "10px"
  },
  
  rangeInput: {
    width: "100%",
    marginTop: "10px"
  },
  
  formSection: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    padding: "30px",
    marginBottom: "30px"
  },
  
  sectionTitle: {
    color: "#fff",
    marginBottom: "20px",
    fontSize: "1.5rem"
  },
  
  form: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px"
  },
  
  input: {
    padding: "12px 15px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(0,0,0,0.3)",
    color: "#fff",
    fontSize: "1rem",
    outline: "none"
  },
  
  select: {
    padding: "12px 15px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(0,0,0,0.3)",
    color: "#fff",
    fontSize: "1rem",
    cursor: "pointer"
  },
  
  addButton: {
    padding: "12px 25px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
    color: "#fff",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s ease"
  },
  
  listSection: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    padding: "30px",
    marginBottom: "30px"
  },
  
  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "15px"
  },
  
  filterGroup: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },
  
  filterSelect: {
    padding: "8px 15px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(0,0,0,0.3)",
    color: "#fff",
    cursor: "pointer"
  },
  
  viewButtons: {
    display: "flex",
    gap: "8px"
  },
  
  viewButton: {
    padding: "8px 15px",
    borderRadius: "8px",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    transition: "all 0.3s ease"
  },
  
  list: {
    listStyle: "none",
    padding: 0
  },
  
  listItem: {
    padding: "15px",
    marginBottom: "10px",
    background: "rgba(0,0,0,0.3)",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "all 0.3s ease",
    animation: "slideInFromLeft 0.5s ease-out forwards",
    opacity: 0
  },
  
  transactionInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "5px"
  },
  
  transactionTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: "1.1rem"
  },
  
  transactionCategory: {
    color: "#aaa",
    fontSize: "0.8rem"
  },
  
  transactionDate: {
    color: "#666",
    fontSize: "0.7rem"
  },
  
  transactionAmount: {
    display: "flex",
    alignItems: "center",
    gap: "15px"
  },
  
  incomeAmount: {
    color: "#4ade80",
    fontWeight: "bold",
    fontSize: "1.1rem"
  },
  
  expenseAmount: {
    color: "#f87171",
    fontWeight: "bold",
    fontSize: "1.1rem"
  },
  
  deleteButton: {
    background: "rgba(239,68,68,0.2)",
    border: "none",
    padding: "5px 10px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "1rem",
    transition: "all 0.2s ease"
  },
  
  emptyState: {
    textAlign: "center",
    padding: "40px",
    color: "#aaa"
  },
  
  emptyEmoji: {
    fontSize: "3rem",
    display: "block",
    marginBottom: "10px"
  },
  
  statsInsights: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "30px"
  },
  
  statsCard: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(10px)",
    borderRadius: "15px",
    padding: "20px",
    color: "#fff"
  },
  
  topCategory: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginTop: "10px",
    color: "#a78bfa"
  },
  
  topAmount: {
    fontSize: "1rem",
    marginTop: "5px",
    color: "#fbbf24"
  },
  
  monthStat: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
    padding: "8px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "8px"
  },
  
  chartSection: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    padding: "30px"
  }
};

// Add animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes float1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(10%, 10%) scale(1.1); }
  }
  @keyframes float2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(-10%, -10%) scale(1.2); }
  }
  @keyframes float3 {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(5%, -5%) rotate(10deg); }
  }
  @keyframes titleGlow {
    0%, 100% { text-shadow: 0 0 20px rgba(147,51,234,0.5); }
    50% { text-shadow: 0 0 40px rgba(147,51,234,0.8); }
  }
  @keyframes floatEmoji {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  @keyframes slideInFromLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { margin: 0; overflow-x: hidden; }
  button:hover { transform: scale(1.05); transition: all 0.3s ease; }
`;
document.head.appendChild(styleSheet);

export default App;
