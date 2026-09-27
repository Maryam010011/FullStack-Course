const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const errorMessage = document.getElementById("errorMessage");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");

function createTaskElement(text) {
  const li = document.createElement("li");

  const span = document.createElement("span");
  span.textContent = text;

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.className = "delete-btn";

  li.appendChild(span);
  li.appendChild(deleteBtn);

  span.addEventListener("click", () => {
    li.classList.toggle("completed");
  });

  return li;
}

function updateTaskCount() {
  const count = taskList.children.length;
  taskCount.textContent =
    count === 0 ? "No tasks yet." : `${count} task${count === 1 ? "" : "s"}`;
}

function addTask() {
  const value = taskInput.value.trim();

  if (value === "") {
    errorMessage.textContent = "Please type a task before adding it.";
    return;
  }

  errorMessage.textContent = "";
  const li = createTaskElement(value);
  taskList.appendChild(li);
  taskInput.value = "";
  taskInput.focus();
  updateTaskCount();
}

addBtn.addEventListener("click", () => {
  addTask();
});

taskInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    addTask();
  }
});
  
taskList.addEventListener("click", (event) => {
  if (event.target.classList.contains("delete-btn")) {
    event.target.closest("li").remove();
    updateTaskCount();
  }
});

clearCompletedBtn.addEventListener("click", () => {
  const completedTasks = taskList.querySelectorAll("li.completed");

  completedTasks.forEach((task) => {
    task.remove();
  });

  updateTaskCount();
});

updateTaskCount();