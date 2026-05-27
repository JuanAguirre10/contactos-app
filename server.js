const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base de datos en memoria
let contacts = [
  { id: 1, name: "Juan Pérez", email: "juan@email.com", phone: "999111222" },
  { id: 2, name: "María García", email: "maria@email.com", phone: "999333444" },
];
let nextId = 3;

// ─── FRONTEND ───────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Agenda de Contactos</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; background: #f0f4f8; color: #333; }
    header { background: #2563eb; color: white; padding: 20px 40px; }
    header h1 { font-size: 1.8rem; }
    .container { max-width: 900px; margin: 30px auto; padding: 0 20px; }
    .card { background: white; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .card h2 { margin-bottom: 16px; color: #2563eb; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 10px; align-items: end; }
    input { padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 0.95rem; width: 100%; }
    input:focus { outline: none; border-color: #2563eb; }
    button { padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-size: 0.95rem; font-weight: 600; }
    .btn-add { background: #2563eb; color: white; }
    .btn-add:hover { background: #1d4ed8; }
    .btn-delete { background: #ef4444; color: white; padding: 6px 14px; font-size: 0.85rem; }
    .btn-edit { background: #f59e0b; color: white; padding: 6px 14px; font-size: 0.85rem; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f8fafc; padding: 12px 16px; text-align: left; font-size: 0.85rem; color: #666; border-bottom: 2px solid #e2e8f0; }
    td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; }
    tr:hover td { background: #f8fafc; }
    .actions { display: flex; gap: 8px; }
    .badge { background: #eff6ff; color: #2563eb; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; }
    #msg { padding: 10px 16px; border-radius: 8px; margin-bottom: 16px; display: none; }
    .success { background: #dcfce7; color: #16a34a; display: block !important; }
    .error { background: #fee2e2; color: #dc2626; display: block !important; }
  </style>
</head>
<body>
  <header><h1>📋 Agenda de Contactos</h1></header>
  <div class="container">

    <div class="card">
      <h2 id="form-title">➕ Nuevo Contacto</h2>
      <div id="msg"></div>
      <div class="form-grid">
        <input type="hidden" id="editId" />
        <input type="text" id="name" placeholder="Nombre completo" />
        <input type="email" id="email" placeholder="Correo electrónico" />
        <input type="text" id="phone" placeholder="Teléfono" />
        <button class="btn-add" onclick="saveContact()">Guardar</button>
      </div>
    </div>

    <div class="card">
      <h2>📁 Lista de Contactos <span class="badge" id="count">0</span></h2>
      <table>
        <thead>
          <tr><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Acciones</th></tr>
        </thead>
        <tbody id="tbody"></tbody>
      </table>
    </div>

  </div>

  <script>
    async function loadContacts() {
      const res = await fetch('/api/contacts');
      const data = await res.json();
      document.getElementById('count').textContent = data.length;
      const tbody = document.getElementById('tbody');
      tbody.innerHTML = data.map(c => \`
        <tr>
          <td><strong>\${c.name}</strong></td>
          <td>\${c.email}</td>
          <td>\${c.phone}</td>
          <td class="actions">
            <button class="btn-edit" onclick="editContact(\${c.id}, '\${c.name}', '\${c.email}', '\${c.phone}')">✏️ Editar</button>
            <button class="btn-delete" onclick="deleteContact(\${c.id})">🗑️ Eliminar</button>
          </td>
        </tr>
      \`).join('');
    }

    function showMsg(text, type) {
      const msg = document.getElementById('msg');
      msg.textContent = text;
      msg.className = type;
      setTimeout(() => msg.className = '', 3000);
    }

    function clearForm() {
      document.getElementById('editId').value = '';
      document.getElementById('name').value = '';
      document.getElementById('email').value = '';
      document.getElementById('phone').value = '';
      document.getElementById('form-title').textContent = '➕ Nuevo Contacto';
    }

    async function saveContact() {
      const id = document.getElementById('editId').value;
      const body = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
      };
      if (!body.name || !body.email || !body.phone) return showMsg('Completa todos los campos', 'error');

      if (id) {
        await fetch(\`/api/contacts/\${id}\`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
        showMsg('Contacto actualizado ✅', 'success');
      } else {
        await fetch('/api/contacts', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
        showMsg('Contacto agregado ✅', 'success');
      }
      clearForm();
      loadContacts();
    }

    function editContact(id, name, email, phone) {
      document.getElementById('editId').value = id;
      document.getElementById('name').value = name;
      document.getElementById('email').value = email;
      document.getElementById('phone').value = phone;
      document.getElementById('form-title').textContent = '✏️ Editar Contacto';
      window.scrollTo(0, 0);
    }

    async function deleteContact(id) {
      if (!confirm('¿Eliminar este contacto?')) return;
      await fetch(\`/api/contacts/\${id}\`, { method: 'DELETE' });
      showMsg('Contacto eliminado 🗑️', 'success');
      loadContacts();
    }

    loadContacts();
  </script>
</body>
</html>`);
});

// ─── API REST ────────────────────────────────────────────────────────────────

// GET todos
app.get("/api/contacts", (req, res) => {
  res.json(contacts);
});

// GET uno
app.get("/api/contacts/:id", (req, res) => {
  const contact = contacts.find((c) => c.id === parseInt(req.params.id));
  if (!contact) return res.status(404).json({ error: "No encontrado" });
  res.json(contact);
});

// POST crear
app.post("/api/contacts", (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email || !phone)
    return res.status(400).json({ error: "Faltan campos" });
  const newContact = { id: nextId++, name, email, phone };
  contacts.push(newContact);
  res.status(201).json(newContact);
});

// PUT editar
app.put("/api/contacts/:id", (req, res) => {
  const index = contacts.findIndex((c) => c.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: "No encontrado" });
  const { name, email, phone } = req.body;
  contacts[index] = { ...contacts[index], name, email, phone };
  res.json(contacts[index]);
});

// DELETE eliminar
app.delete("/api/contacts/:id", (req, res) => {
  const index = contacts.findIndex((c) => c.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: "No encontrado" });
  contacts.splice(index, 1);
  res.json({ message: "Eliminado correctamente" });
});

// ─── INICIAR ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});