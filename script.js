let todos = JSON.parse(localStorage.getItem("todos")) || [];
let compactMode = false;
let backgrounds = ["background-default", "background-sunset", "background-galaxy", "background-gradientfun"];
let currentBg = 0;

/* ===== Utility ===== */
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `px-4 py-2 rounded shadow text-white ${
    type === "success" ? "bg-green-500" :
    type === "error" ? "bg-red-500" :
    "bg-blue-500"
  }`;
  toast.innerText = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/* ===== Todo Functions ===== */
function addTodo() {
  const input = document.getElementById("todoInput");
  const title = input.value.trim();
  if (!title) {
    showToast("Todo tidak boleh kosong!", "error");
    return;
  }
  if (todos.some(t => t.title.toLowerCase() === title.toLowerCase())) {
    showToast("Judul todo sudah ada!", "error");
    return;
  }
  todos.push({ title, done: false });
  saveTodos();
  input.value = "";
  renderTodos();
  showToast("Todo ditambahkan!", "success");
}

function toggleTodo(index) {
  todos[index].done = !todos[index].done;
  saveTodos();
  renderTodos();
}
function deleteTodo(index) {
  todos.splice(index, 1);
  saveTodos();
  renderTodos();
  showToast("Todo dihapus!", "success");
}
function editTodo(index) {
  const newTitle = prompt("Edit todo:", todos[index].title);
  if (newTitle && newTitle.trim() !== "") {
    if (todos.some((t, i) => i !== index && t.title.toLowerCase() === newTitle.toLowerCase())) {
      showToast("Judul todo sudah ada!", "error");
      return;
    }
    todos[index].title = newTitle.trim();
    saveTodos();
    renderTodos();
    showToast("Todo berhasil diubah!", "success");
  }
}

/* ===== Clear All Modal ===== */
function openConfirmModal() {
  document.getElementById("confirmModal").classList.remove("hidden");
}
function closeConfirmModal() {
  document.getElementById("confirmModal").classList.add("hidden");
}
function clearAllTodos() {
  todos = [];
  saveTodos();
  renderTodos();
  showToast("Semua todo telah dihapus!", "success");
  closeConfirmModal();
}

/* ===== Render ===== */
function renderTodos() {
  const list = document.getElementById("todoList");
  list.innerHTML = "";
  const filter = document.getElementById("filter").value;
  const search = document.getElementById("searchInput").value.toLowerCase();

  todos
    .filter(todo => {
      if (filter === "done") return todo.done;
      if (filter === "not-done") return !todo.done;
      return true;
    })
    .filter(todo => todo.title.toLowerCase().includes(search))
    .forEach((todo, index) => {
      const li = document.createElement("li");
      li.className = `flex items-center justify-between p-2 border rounded ${compactMode ? "text-sm" : ""} ${
        todo.done ? "bg-green-100 dark:bg-green-700" : "bg-gray-50 dark:bg-gray-700"
      }`;

      li.innerHTML = `
        <span class="flex-1 cursor-pointer ${todo.done ? "line-through text-gray-500 dark:text-gray-300" : ""}" onclick="toggleTodo(${index})">
          ${todo.title}
        </span>
        <div class="flex gap-2 ml-2">
          <button onclick="editTodo(${index})" class="px-2 py-1 text-xs bg-yellow-400 rounded hover:bg-yellow-500">✏️</button>
          <button onclick="deleteTodo(${index})" class="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">🗑️</button>
        </div>
      `;
      list.appendChild(li);
    });

  new Sortable(list, {
    animation: 150,
    onEnd: function (evt) {
      const [moved] = todos.splice(evt.oldIndex, 1);
      todos.splice(evt.newIndex, 0, moved);
      saveTodos();
    }
  });
}

/* ===== Theme & Mode Toggle ===== */
const themeToggle = document.getElementById("themeToggle");
const compactToggle = document.getElementById("compactToggle");
const clearAllBtn = document.getElementById("clearAllBtn");
const cancelClear = document.getElementById("cancelClear");
const confirmClear = document.getElementById("confirmClear");
const bgToggle = document.getElementById("bgToggle");

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  themeToggle.textContent = isDark ? "☀️" : "🌙";
});
compactToggle.addEventListener("click", () => {
  compactMode = !compactMode;
  renderTodos();
});
clearAllBtn.addEventListener("click", openConfirmModal);
cancelClear.addEventListener("click", closeConfirmModal);
confirmClear.addEventListener("click", clearAllTodos);

bgToggle.addEventListener("click", () => {
  document.body.classList.remove(...backgrounds);
  currentBg = (currentBg + 1) % backgrounds.length;
  document.body.classList.add(backgrounds[currentBg]);
  localStorage.setItem("background", backgrounds[currentBg]);
});

/* ===== Init ===== */
window.onload = () => {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️";
  }
  const savedBg = localStorage.getItem("background");
  if (savedBg && backgrounds.includes(savedBg)) {
    document.body.classList.remove(...backgrounds);
    document.body.classList.add(savedBg);
    currentBg = backgrounds.indexOf(savedBg);
  }
  renderTodos();
};
