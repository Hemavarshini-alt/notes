// Theme toggle
const toggleThemeBtn = document.getElementById("toggle-theme");
if(toggleThemeBtn){
  toggleThemeBtn.addEventListener("click", ()=>{
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark")?"dark":"light");
  });
}
if(localStorage.getItem("theme")==="dark") document.body.classList.add("dark");

// Quotes
const quoteText = document.getElementById("quote-text");
if(quoteText){
  const quotes = [
    "🌟 Stay focused and never give up!",
    "💡 Small steps every day lead to big results!",
    "🔥 Your tasks today define your tomorrow!",
    "🌈 Work smart, not just hard!",
    "🚀 Dream big, act bigger!"
  ];
  quoteText.textContent = quotes[Math.floor(Math.random()*quotes.length)];
}

// Backend API URL
const API_URL = "https://notes-backend-3jz5.onrender.com/api/tasks";

// Tasks CRUD
const tasksTableBody = document.querySelector("#tasks-table tbody");
const addBtn = document.getElementById("add-task-btn");
if(tasksTableBody && addBtn){
  const titleInput = document.getElementById("task-title");
  const descInput = document.getElementById("task-desc");
  const importanceInput = document.getElementById("task-importance");
  const statusInput = document.getElementById("task-status");
  const dueInput = document.getElementById("task-due");

  async function fetchTasks(){
    const res = await fetch(API_URL);
    const data = await res.json();
    displayTasks(data);
  }

  async function createTask(task){
    await fetch(API_URL, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(task)});
    fetchTasks();
  }

  async function updateTask(id, updatedTask){
    await fetch(`${API_URL}/${id}`, {method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(updatedTask)});
    fetchTasks();
  }

  async function deleteTask(id){
    await fetch(`${API_URL}/${id}`, {method:"DELETE"});
    fetchTasks();
  }

  addBtn.addEventListener("click", ()=>{
    const title = titleInput.value.trim();
    const desc = descInput.value.trim();
    const importance = importanceInput.value;
    const status = statusInput.value;
    const due = dueInput.value;
    if(!title||!desc||!due) return alert("Fill all fields!");
    createTask({title,description:desc,importance,status,dueDate:due});
    titleInput.value=""; descInput.value=""; importanceInput.value="Normal"; statusInput.value="Pending"; dueInput.value="";
  });

  function displayTasks(tasks){
    tasksTableBody.innerHTML="";
    if(tasks.length===0){
      tasksTableBody.innerHTML=`<tr><td colspan="6">No tasks added yet!</td></tr>`;
      return;
    }
    tasks.forEach(task=>{
      const tr=document.createElement("tr");
      tr.innerHTML=`
        <td>${task.title}</td>
        <td>${task.description}</td>
        <td>${task.importance}</td>
        <td>${task.status}</td>
        <td>${task.dueDate.slice(0,10)}</td>
        <td>
          <button class="edit-btn">Edit ✏️</button>
          <button class="delete-btn">Delete ❌</button>
        </td>
      `;
      tr.querySelector(".edit-btn").addEventListener("click", ()=>{
        const newTitle = prompt("Edit Title:", task.title);
        const newDesc = prompt("Edit Description:", task.description);
        const newImportance = prompt("Edit Importance:", task.importance);
        const newStatus = prompt("Edit Status:", task.status);
        const newDue = prompt("Edit Due Date (YYYY-MM-DD):", task.dueDate.slice(0,10));
        if(newTitle) updateTask(task._id,{title:newTitle,description:newDesc,importance:newImportance,status:newStatus,dueDate:newDue});
      });
      tr.querySelector(".delete-btn").addEventListener("click", ()=> deleteTask(task._id));
      tasksTableBody.appendChild(tr);
    });
  }

  fetchTasks();
}

// Reports page
const reportDiv = document.getElementById("report-stats");
if(reportDiv){
  async function showReports(){
    const res = await fetch(API_URL);
    const tasks = await res.json();
    const total = tasks.length;
    const pending = tasks.filter(t=>t.status==="Pending").length;
    const completed = tasks.filter(t=>t.status==="Completed").length;
    const important = tasks.filter(t=>t.importance==="Important").length;
    const overdue = tasks.filter(t=>new Date(t.dueDate)<new Date() && t.status==="Pending").length;
    reportDiv.innerHTML=`
      <p>Total Tasks: ${total}</p>
      <p>Pending: ${pending}</p>
      <p>Completed: ${completed}</p>
      <p>Important: ${important}</p>
      <p>Overdue: ${overdue}</p>
    `;
  }
  showReports();
}