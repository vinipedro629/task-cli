/*
# Recuperar Senha – Backend de Autenticação (Node.js + Express)
Veja mais detalhes no readme!

Este backend fornece endpoints para:
- Registro de usuário
- Login
- Recuperação de senha (senha temporária via API, apenas para demonstração)

Instruções:
1. Instale as dependências: `npm install express bcryptjs cors`
2. Coloque este arquivo como `backend.js` (ou `app.js`) na raiz do projeto.
3. Rode: `node backend.js`
4. O arquivo `users.json` será criado automaticamente.
5. O frontend consome `/api/register`, `/api/login` e `/api/reset-password`. Veja exemplos no readme.

---

*/

const express = require("express");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const USERS_DB = path.join(__dirname, "users.json");
const app = express();

app.use(express.json());

// Permite requisições locais (localhost, 127.0.0.1 e outros para testes)
app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        callback(null, true);
      } else {
        // Em produção, ajuste aqui! (Por padrão, permite para facilitar testes didáticos)
        callback(null, true);
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);

// Utilitários de persistência
function loadUsers() {
  try {
    if (!fs.existsSync(USERS_DB)) {
      fs.writeFileSync(USERS_DB, "[]");
    }
    const data = fs.readFileSync(USERS_DB, "utf8");
    return Array.isArray(JSON.parse(data)) ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Erro ao acessar ou ler o banco de usuários.");
    return [];
  }
}

function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_DB, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error("Erro ao salvar usuários.");
  }
}

// Validações
function isValidUsername(username) {
  return (
    typeof username === "string" &&
    username.length >= 3 &&
    /^[a-zA-Z0-9_]+$/.test(username)
  );
}
function isValidPassword(password) {
  return typeof password === "string" && password.length >= 4;
}

// Registro
app.post("/api/register", (req, res) => {
  const { username, password } = req.body;

  if (!isValidUsername(username) || !isValidPassword(password)) {
    return res.status(400).json({
      error:
        "Usuário ou senha inválidos. Usuário: min 3 letras/números/_; Senha: min 4 caracteres",
    });
  }

  const users = loadUsers();
  if (users.find((u) => u.username === username)) {
    return res.status(409).json({ error: "Usuário já existe" });
  }

  const hash = bcrypt.hashSync(password, 10);
  users.push({ username, password: hash });
  saveUsers(users);

  res.json({ message: "Usuário registrado com sucesso!" });
});

// Login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!isValidUsername(username) || !isValidPassword(password)) {
    return res.status(400).json({ error: "Usuário ou senha inválidos." });
  }

  const users = loadUsers();
  const user = users.find((u) => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    // Resposta genérica (protege se usuário existe ou não)
    return res.status(401).json({ error: "Usuário ou senha incorretos" });
  }

  res.json({ message: "Login realizado com sucesso!" });
});

// Recuperação de senha (gera senha temporária)
app.post("/api/reset-password", (req, res) => {
  // Confere Content-Type
  const reqContentType = req.get("content-type");
  const validContentType =
    req.is("application/json") || /^application\/json\b/.test(reqContentType || "");

  if (!validContentType) {
    return res.status(400).json({ error: "Conteúdo inválido." });
  }

  const { username } = req.body;
  if (!isValidUsername(username)) {
    return res.status(400).json({
      error:
        "Usuário inválido. Só letras, números e _ (underline), mínimo 3 caracteres.",
    });
  }

  const users = loadUsers();
  const user = users.find((u) => u.username === username);

  // Sempre resposta genérica!
  if (!user) {
    return res.json({
      message: "Se este usuário existir, as instruções foram enviadas (simulação)",
    });
  }

  // Gera uma senha temporária (visible no console, normalmente enviaria por email)
  const tempPass = Math.random().toString(36).slice(-8);
  user.password = bcrypt.hashSync(tempPass, 10);
  saveUsers(users);

  console.log(
    `Usuário ${username} solicitou reset. Senha temporária: ${tempPass}`
  );

  res.json({
    message: `Senha temporária: ${tempPass} (anote e faça login, depois altere a senha).`,
  });
});

// Fallback para rotas /api inexistentes
// Corrigido: Express v5+ e path-to-regexp não aceitam mais 'api/*' (asterisco sem nome).
// Use uma expressão regular para capturar rotas que começam com /api/ mas não coincidem com as existentes.
app.all(/^\/api(\/.+)?$/, (req, res) => {
  res.status(404).type("application/json").json({ error: "Rota não encontrada." });
});

// Inicializa backend
const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
  console.log(`✅ Backend rodando na porta ${PORT}`);
});
//
