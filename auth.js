// Exemplo de implementação simples de autenticação de usuários com Node.js e JSON como banco de dados

// Salve este código em um arquivo chamado "auth.js" (ou anexe ao seu CLI atual)
// Necessita do pacote 'readline-sync': npm install readline-sync

const fs = require("fs");
const path = require("path");
const readline = require("readline-sync");

const USERS_FILE = path.join(process.cwd(), "users.json");

// Utilitários
function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function userExists(username) {
  const users = loadUsers();
  return users.some((u) => u.username === username);
}

// Registro de novo usuário
function register() {
  const username = readline.question("Novo nome de usuário: ");
  if (userExists(username)) {
    console.log("Usuário já existe!");
    return;
  }
  const password = readline.questionNewPassword("Nova senha: ");
  const users = loadUsers();
  users.push({ username, password }); // Para produção, use hash de senha!
  saveUsers(users);
  console.log("Usuário cadastrado com sucesso!");
}

// Login de usuário
function login() {
  const username = readline.question("Usuário: ");
  const password = readline.question("Senha: ", { hideEchoBack: true });
  const users = loadUsers();
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (user) {
    console.log(`Bem-vindo, ${username}!`);
    // Aqui você pode carregar/salvar tarefas específicas do usuário
    return username;
  } else {
    console.log("Usuário ou senha inválidos!");
    return null;
  }
}

// Exemplo de uso:
console.log("1 - Cadastrar | 2 - Entrar");
const opt = readline.question("Escolha: ");
if (opt === "1") register();
else if (opt === "2") login();

// Dica: Para separar as tarefas por usuário,
// armazene um campo 'owner' em cada tarefa no seu tasks.json!
