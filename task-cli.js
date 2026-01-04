#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(process.cwd(), "tasks.json");

/* ------------------ UTILIDADES ------------------ */

function loadTasks() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }

  const data = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(data);
}

function saveTasks(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

function getNextId(tasks) {
  if (tasks.length === 0) return 1;
  return Math.max(...tasks.map((t) => t.id)) + 1;
}

function now() {
  return new Date().toISOString();
}

/* ------------------ COMANDOS ------------------ */

function addTask(description) {
  if (!description) {
    console.error("Descrição da tarefa é obrigatória.");
    return;
  }

  const tasks = loadTasks();

  const task = {
    id: getNextId(tasks),
    description,
    status: "todo",
    createdAt: now(),
    updatedAt: now(),
  };

  tasks.push(task);
  saveTasks(tasks);

  console.log(`Task adicionada com sucesso (ID: ${task.id})`);
}

function updateTask(id, description) {
  const tasks = loadTasks();
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    console.error("Tarefa não encontrada.");
    return;
  }

  task.description = description;
  task.updatedAt = now();

  saveTasks(tasks);
  console.log("Task atualizada com sucesso.");
}

function deleteTask(id) {
  const tasks = loadTasks();
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    console.error("Tarefa não encontrada.");
    return;
  }

  tasks.splice(index, 1);
  saveTasks(tasks);
  console.log("Task removida com sucesso.");
}

function markTask(id, status) {
  const tasks = loadTasks();
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    console.error("Tarefa não encontrada.");
    return;
  }

  task.status = status;
  task.updatedAt = now();

  saveTasks(tasks);
  console.log(`Task marcada como ${status}.`);
}

function listTasks(filter) {
  const tasks = loadTasks();

  const filteredTasks = filter
    ? tasks.filter((t) => t.status === filter)
    : tasks;

  if (filteredTasks.length === 0) {
    console.log("Nenhuma tarefa encontrada.");
    return;
  }

  filteredTasks.forEach((task) => {
    console.log(
      `[${task.id}] ${task.description} | ${task.status} | Criado: ${task.createdAt}`
    );
  });
}

/* ------------------ CLI ------------------ */

const [, , command, ...args] = process.argv;

switch (command) {
  case "add":
    addTask(args.join(" "));
    break;

  case "update":
    updateTask(Number(args[0]), args.slice(1).join(" "));
    break;

  case "delete":
    deleteTask(Number(args[0]));
    break;

  case "mark-in-progress":
    markTask(Number(args[0]), "in-progress");
    break;

  case "mark-done":
    markTask(Number(args[0]), "done");
    break;

  case "list":
    listTasks(args[0]);
    break;

  default:
    console.log(`
Uso:
  task-cli add "Descrição da tarefa"
  task-cli update <id> "Nova descrição"
  task-cli delete <id>
  task-cli mark-in-progress <id>
  task-cli mark-done <id>
  task-cli list
  task-cli list todo
  task-cli list in-progress
  task-cli list done
    `);
}
