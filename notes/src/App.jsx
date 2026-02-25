import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://notes-backend-3jz5.onrender.com/api/tasks";

const quotes = [
  "🌟 Stay focused and never give up!",
  "💡 Small steps every day lead to big results!",
  "🔥 Your tasks today define your tomorrow!",
  "🌈 Work smart, not just hard!",
  "🚀 Dream big, act bigger!",
  "Small steps every day lead to big success.",
  "Discipline today, freedom tomorrow.",
  "Push yourself — no one else will do it for you.",
  "Stay focused. Stay consistent.",
  "Your only limit is your mindset."
];

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [tasks, setTasks] = useState([]);
  const [quote, setQuote] = useState("");
  const [theme, setTheme] = useState("light");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    importance: "Normal",
    status: "Pending",
    dueDate: ""
  });
  const [editingId, setEditingId] = useState(null);

  // Theme persistence
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.body.classList.toggle("dark", savedTheme === "dark");
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Page-specific effects
  useEffect(() => {
    if (currentPage === "home") {
      getRandomQuote();
      const interval = setInterval(getRandomQuote, 10000);
      return () => clearInterval(interval);
    } else if (currentPage === "tasks") {
      fetchTasks();
    }
  }, [currentPage]);

  const getRandomQuote = () => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  };

  // TASKS CRUD
  const fetchTasks = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const createTask = async (task) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });
      if (!res.ok) throw new Error("Failed to create");
      fetchTasks();
    } catch (err) {
      console.error("Create error:", err);
      alert("Failed to add task");
    }
  };

  const updateTask = async (id, updatedTask) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      });
      fetchTasks();
      setEditingId(null);
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      fetchTasks();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedData = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim()
    };
    
    if (!trimmedData.title || !trimmedData.description || !trimmedData.dueDate) {
      alert("Please fill title, description, and due date!");
      return;
    }
    
    if (editingId) {
      updateTask(editingId, trimmedData);
    } else {
      createTask(trimmedData);
    }
    setFormData({ title: "", description: "", importance: "Normal", status: "Pending", dueDate: "" });
  };

  const handleEdit = (task) => {
    setEditingId(task._id);
    setFormData({
      title: task.title,
      description: task.description,
      importance: task.importance,
      status: task.status,
      dueDate: task.dueDate.slice(0, 10)
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ title: "", description: "", importance: "Normal", status: "Pending", dueDate: "" });
  };

  const getStats = () => {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === "Pending").length;
    const completed = tasks.filter(t => t.status === "Completed").length;
    const important = tasks.filter(t => t.importance === "Important").length;
    const overdue = tasks.filter(t => new Date(t.dueDate) < new Date() && t.status === "Pending").length;
    return { total, pending, completed, important, overdue };
  };

  return (
    <div className="app-wrapper">
      <div className={`app ${theme}`}>
        <div className="container">
          <h1 className="jello">
            {currentPage === "home" ? "Welcome to Your Task Manager 🌟" : 
             currentPage === "tasks" ? "📝 Tasks" :
             currentPage === "reports" ? "📊 Task Reports" :
             "⚙️ Quotes"}
          </h1>

          {/* Navigation */}
          <nav className="nav">
            <button className={`nav-btn ${currentPage === "home" ? "active" : ""}`} onClick={() => setCurrentPage("home")}>
              🏠 Home
            </button>
            <button className={`nav-btn ${currentPage === "tasks" ? "active" : ""}`} onClick={() => setCurrentPage("tasks")}>
              📝 Tasks
            </button>
            <button className={`nav-btn ${currentPage === "reports" ? "active" : ""}`} onClick={() => setCurrentPage("reports")}>
              📊 Reports
            </button>
            <button className={`nav-btn ${currentPage === "settings" ? "active" : ""}`} onClick={() => setCurrentPage("settings")}>
              ⚙️ Quotes
            </button>
            <button className="theme-toggle" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
              {theme === "light" ? "🌙 Dark" : "☀️ Light"}
            </button>
          </nav>

          {/* HOME PAGE */}
          {currentPage === "home" && (
            <div className="quote">
              <p>"{quote || quotes[0]}"</p>
            </div>
          )}

          {/* TASKS PAGE - FULL SIZE */}
          {currentPage === "tasks" && (
            <div className="page-content full-width">
              <form className="task-input" onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Task Title *"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Task Description * 😃"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
                <div className="task-meta">
                  <label>
                    Importance:
                    <select value={formData.importance} onChange={(e) => setFormData({ ...formData, importance: e.target.value })}>
                      <option value="Normal">Normal</option>
                      <option value="Important">Important</option>
                    </select>
                  </label>
                  <label>
                    Status:
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </label>
                  <label>
                    Due Date *:
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      required
                    />
                  </label>
                </div>
                <div className="form-actions">
                  <button type="submit" className="add-btn">
                    {editingId ? "✅ Update Task" : "✅ Add Task"}
                  </button>
                  {editingId && (
                    <button type="button" className="cancel-btn" onClick={handleCancel}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <div className="tasks-container">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th><th>Description</th><th>Importance</th><th>Status</th><th>Due Date</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.length === 0 ? (
                      <tr><td colSpan="6" className="no-tasks">No tasks yet! Add one above 👆</td></tr>
                    ) : (
                      tasks.map((task) => (
                        <tr key={task._id} className={new Date(task.dueDate) < new Date() && task.status === "Pending" ? "overdue" : ""}>
                          <td>{task.title}</td>
                          <td>{task.description}</td>
                          <td>{task.importance}</td>
                          <td>{task.status}</td>
                          <td>{task.dueDate.slice(0,10)}</td>
                          <td>
                            <button className="edit-btn" onClick={() => handleEdit(task)}>✏️ Edit</button>
                            <button className="delete-btn" onClick={() => deleteTask(task._id)}>❌ Delete</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORTS PAGE */}
          {currentPage === "reports" && (
            <div className="report-stats">
              {(() => {
                const stats = getStats();
                return (
                  <>
                    <div><strong>Total:</strong> {stats.total}</div>
                    <div><strong>Pending:</strong> {stats.pending}</div>
                    <div><strong>Completed:</strong> {stats.completed}</div>
                    <div><strong>Important:</strong> {stats.important}</div>
                    <div className="overdue"><strong>Overdue:</strong> {stats.overdue}</div>
                  </>
                );
              })()}
            </div>
          )}


          {/* QUOTES PAGE - FULL SIZE */}
          {currentPage === "settings" && (
            <div className="page-content full-width">
              <div className="quotes-section">
                <h2>🌟 Short & Powerful</h2>
                <div className="quote-list">
                  <p>"Small steps every day lead to big success."</p>
                  <p>"Discipline today, freedom tomorrow."</p>
                  <p>"Push yourself — no one else will do it for you."</p>
                  <p>"Stay focused. Stay consistent."</p>
                  <p>"Your only limit is your mindset."</p>
                </div>
                <h2>🚀 Success & Growth</h2>
                <div className="quote-list">
                  <p>"Dream big. Start small. Act now."</p>
                  <p>"Success is built on daily habits."</p>
                  <p>"Don't stop until you're proud."</p>
                  <p>"Hard work beats talent when talent doesn't work hard."</p>
                  <p>"Make today count."</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
