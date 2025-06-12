// Imports
import './style.css';
import {
  registerUser,
  getUsers,
  updateUser,
  deleteUser
} from './bases/ApiClientes.ts';
import type { NewUser, User, MessageResponse } from './bases/UserTypes.ts';

import {
  createBodega,
  getBodegas,
  getBodega,
  updateBodega,
  deleteBodega
} from './bases/ApiBodega.ts';
import type { NewBodega, Bodega } from './bases/BodegaTypes.ts';

// ===================================================================================
// Entry point
// ===================================================================================
window.addEventListener('DOMContentLoaded', () => {
  initUserCrud();
  initBodegaCrud();
});

// ===================================================================================
// User CRUD Section
// ===================================================================================
function initUserCrud() {
  const section = document.createElement('section');
  section.classList.add('crud-section');
  document.querySelector('#app')!.appendChild(section);

  // Title
  const title = document.createElement('h2');
  title.textContent = 'CRUD de Usuarios';
  section.appendChild(title);

  // Form
  const userForm = document.createElement('form');
  userForm.id = 'formRegistro';
  section.appendChild(userForm);

  let editingDni: string | null = null;

  function createUserField(
    labelText: string,
    type: string,
    name: keyof NewUser,
    placeholder = ''
  ) {
    const wr = document.createElement('div');
    wr.className = 'form-group';
    const lbl = document.createElement('label');
    lbl.htmlFor = name;
    lbl.textContent = labelText;
    const inp = document.createElement('input');
    inp.type = type;
    inp.id = name;
    inp.name = name;
    inp.placeholder = placeholder;
    inp.required = true;
    wr.append(lbl, inp);
    return wr;
  }

  userForm.append(
    createUserField('Nombres:', 'text', 'usu_nombres', 'Ingresa nombres'),
    createUserField('Apellidos:', 'text', 'usu_apellidos', 'Ingresa apellidos'),
    createUserField('Contraseña:', 'password', 'usu_password', 'Ingresa contraseña'),
    createUserField('Teléfono:', 'tel', 'usu_telefono', 'Ej: 3123456789'),
    createUserField('Correo:', 'email', 'usu_correo', 'Ej: correo@dominio.com'),
    createUserField('Rol:', 'text', 'usu_rol', 'Ej: admin'),
    createUserField('DNI:', 'text', 'usu_dni', 'Ej: 98765432789')
  );

  const userSubmitBtn = document.createElement('button');
  userSubmitBtn.type = 'submit';
  userSubmitBtn.textContent = 'Crear';
  userForm.appendChild(userSubmitBtn);

  const userFeedback = document.createElement('div');
  userFeedback.id = 'feedback-user';
  section.appendChild(userFeedback);

  function showUserMessage(msg: string, isError = false) {
    userFeedback.textContent = msg;
    userFeedback.classList.toggle('error', isError);
    userFeedback.classList.toggle('exito', !isError);
  }

  const userTable = document.createElement('table');
  userTable.innerHTML = `
    <thead>
      <tr>
        <th>DNI</th><th>Nombres</th><th>Apellidos</th><th>Correo</th><th>Rol</th><th>Acciones</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  section.appendChild(userTable);
  const userTbody = userTable.querySelector('tbody')!;

  async function loadUsers() {
    userTbody.innerHTML = `<tr><td colspan="6">Cargando...</td></tr>`;
    try {
      const users = await getUsers();
      if (!users.length) {
        userTbody.innerHTML = `<tr><td colspan="6">No hay usuarios</td></tr>`;
        return;
      }
      userTbody.innerHTML = '';
      users.forEach((u: User) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${u.usu_dni}</td>
          <td>${u.usu_nombres}</td>
          <td>${u.usu_apellidos}</td>
          <td>${u.usu_correo}</td>
          <td>${u.usu_rol}</td>
          <td>
            <button data-action="edit-user" data-dni="${u.usu_dni}">✏️</button>
            <button data-action="delete-user" data-dni="${u.usu_dni}">🗑️</button>
          </td>
        `;
        userTbody.appendChild(tr);
      });
    } catch (err) {
      console.error(err);
      userTbody.innerHTML = `<tr><td colspan="6">Error cargando usuarios</td></tr>`;
    }
  }

  userTable.addEventListener('click', async ev => {
    const btn = (ev.target as HTMLElement).closest('button');
    if (!btn) return;
    const dni = btn.dataset.dni!;
    const action = btn.dataset.action;
    if (action === 'delete-user') {
      if (!confirm(`¿Eliminar usuario con DNI ${dni}?`)) return;
      try {
        const res = await deleteUser(dni);
        showUserMessage(`✅ ${res.message}`);
        await loadUsers();
      } catch (e: any) {
        showUserMessage(`❌ ${e.response?.data?.message || 'Error al eliminar'}`, true);
      }
    } else if (action === 'edit-user') {
      try {
        const users = await getUsers();
        const u = users.find(x => x.usu_dni === dni)!;
        (userForm['usu_nombres'] as HTMLInputElement).value = u.usu_nombres;
        (userForm['usu_apellidos'] as HTMLInputElement).value = u.usu_apellidos;
        (userForm['usu_password'] as HTMLInputElement).value = '';
        (userForm['usu_telefono'] as HTMLInputElement).value = u.usu_telefono;
        (userForm['usu_correo'] as HTMLInputElement).value = u.usu_correo;
        (userForm['usu_rol'] as HTMLInputElement).value = u.usu_rol;
        (userForm['usu_dni'] as HTMLInputElement).value = u.usu_dni;
        editingDni = dni;
        userSubmitBtn.textContent = 'Actualizar';
      } catch {
        showUserMessage('❌ Error al cargar datos para editar', true);
      }
    }
  });

  userForm.addEventListener('submit', async ev => {
    ev.preventDefault();
    const fd = new FormData(userForm);
    const payload: NewUser = {
      usu_nombres: fd.get('usu_nombres')!.toString(),
      usu_apellidos: fd.get('usu_apellidos')!.toString(),
      usu_password: fd.get('usu_password')!.toString(),
      usu_telefono: fd.get('usu_telefono')!.toString(),
      usu_correo: fd.get('usu_correo')!.toString(),
      usu_rol: fd.get('usu_rol')!.toString(),
      usu_dni: fd.get('usu_dni')!.toString(),
    };

    userSubmitBtn.disabled = true;
    showUserMessage('Enviando…');

    try {
      let res: MessageResponse & { id?: string };
      if (editingDni) {
        res = await updateUser(editingDni, payload);
        showUserMessage(`✅ ${res.message}`);
        editingDni = null;
        userSubmitBtn.textContent = 'Crear';
      } else {
        res = await registerUser(payload);
        showUserMessage(`✅ ${res.message} (ID: ${res.id})`);
      }
      userForm.reset();
      await loadUsers();
    } catch (e: any) {
      showUserMessage(`❌ ${e.response?.data?.message || 'Ocurrió un error'}`, true);
    } finally {
      userSubmitBtn.disabled = false;
    }
  });

  loadUsers();
}

// ===================================================================================
// Bodega CRUD Section
// ===================================================================================
function initBodegaCrud() {
  const section = document.createElement('section');
  section.classList.add('crud-section');
  document.querySelector('#app')!.appendChild(section);

  // Title
  const title = document.createElement('h2');
  title.textContent = 'CRUD de Bodegas';
  section.appendChild(title);

  // Form
  const form = document.createElement('form');
  form.id = 'formBodega';
  section.appendChild(form);

  let editingId: number | null = null;

  function createBodegaField(
    labelText: string,
    name: keyof NewBodega,
    type = 'text',
    placeholder = ''
  ) {
    const wr = document.createElement('div');
    wr.className = 'form-group';
    const lbl = document.createElement('label');
    lbl.htmlFor = name;
    lbl.textContent = labelText;
    const inp = document.createElement('input');
    inp.type = type;
    inp.id = name;
    inp.name = name;
    inp.placeholder = placeholder;
    inp.required = true;
    wr.append(lbl, inp);
    return wr;
  }

  form.append(
    createBodegaField('Nombre:', 'bod_nombre', 'text', 'Ej: Principal'),
    createBodegaField('Número:', 'bod_numero', 'text', 'Ej: 001')
  );

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.textContent = 'Crear';
  form.appendChild(submitBtn);

  const feedback = document.createElement('div');
  feedback.id = 'feedback-bodega';
  section.appendChild(feedback);

  function showMsg(msg: string, isErr = false) {
    feedback.textContent = msg;
    feedback.classList.toggle('error', isErr);
    feedback.classList.toggle('exito', !isErr);
  }

  const table = document.createElement('table');
  table.innerHTML = `
    <thead>
      <tr><th>ID</th><th>Número</th><th>Nombre</th><th>Acciones</th></tr>
    </thead>
    <tbody></tbody>
  `;
  section.appendChild(table);
  const tbody = table.querySelector('tbody')!;

  async function loadBodegaList() {
    tbody.innerHTML = `<tr><td colspan="4">Cargando...</td></tr>`;
    try {
      const list = await getBodegas();
      if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="4">No hay bodegas</td></tr>`;
        return;
      }
      tbody.innerHTML = '';
      list.forEach((b: Bodega) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${b.pk_id_bodega}</td>
          <td>${b.bod_numero}</td>
          <td>${b.bod_nombre}</td>
          <td>
            <button data-action="edit-bodega" data-id="${b.pk_id_bodega}">✏️</button>
            <button data-action="delete-bodega" data-id="${b.pk_id_bodega}">🗑️</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    } catch (e) {
      console.error(e);
      tbody.innerHTML = `<tr><td colspan="4">Error cargando bodegas</td></tr>`;
    }
  }

  // Table actions (edit/delete)
  table.addEventListener('click', async ev => {
    const btn = (ev.target as HTMLElement).closest('button');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;
    if (action === 'delete-bodega') {
      if (!confirm(`¿Eliminar bodega ID ${id}?`)) return;
      try {
        const res = await deleteBodega(id);
        showMsg(`✅ ${res.message}`);
        await loadBodegaList();
      } catch (err: any) {
        showMsg(`❌ ${err.response?.data?.message || 'Error al eliminar'}`, true);
      }
    } else if (action === 'edit-bodega') {
      try {
        const b = await getBodega(id);
        (form['bod_nombre'] as HTMLInputElement).value = b.bod_nombre;
        (form['bod_numero'] as HTMLInputElement).value = b.bod_numero;
        editingId = id;
        submitBtn.textContent = 'Actualizar';
      } catch {
        showMsg('❌ Error al cargar bodega', true);
      }
    }
  });

  // Form submit (create/update)
  form.addEventListener('submit', async ev => {
    ev.preventDefault();
    const fd = new FormData(form);
    const payload: NewBodega = {
      bod_nombre: fd.get('bod_nombre')!.toString(),
      bod_numero: fd.get('bod_numero')!.toString(),
    };

    submitBtn.disabled = true;
    showMsg('Enviando…');

    try {
      let b: Bodega;
      if (editingId !== null) {
        b = await updateBodega(editingId, payload);
        showMsg(`✅ Bodega actualizada (ID: ${b.pk_id_bodega})`);
        editingId = null;
        submitBtn.textContent = 'Crear';
      } else {
        b = await createBodega(payload);
        showMsg(`✅ Bodega creada (ID: ${b.pk_id_bodega})`);
      }
      form.reset();
      await loadBodegaList();
    } catch (err: any) {
      showMsg(`❌ ${err.response?.data?.message || 'Error al guardar'}`, true);
    } finally {
      submitBtn.disabled = false;
    }
  });

  // Initial load
  loadBodegaList();
}