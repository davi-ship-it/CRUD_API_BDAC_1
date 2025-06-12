// src/bases/ApiClientes.ts
import axios from 'axios';
import type { NewUser, User, MessageResponse } from './UserTypes.ts';

export const api = axios.create({
  baseURL: 'http://localhost:3000/UsuariosAll',
  timeout: 5000,
});

/** CREATE */
export async function registerUser(user: NewUser): Promise<MessageResponse> {
  const resp = await api.post<MessageResponse>('/Registrar/Free', user);
  return resp.data;
}

/** READ ALL */
export async function getUsers(): Promise<User[]> {
  const resp = await api.get<User[]>('/Listar');   // Ajusta la ruta según tu API
  return resp.data;
}

export async function updateUser(
  usu_dni: string,
  updates: Partial<NewUser>
): Promise<MessageResponse> {
  const payload = { ...updates, usu_dni };
  const resp = await api.put<MessageResponse>('/Actualizar', payload);
  return resp.data;
}

/** DELETE (deleteUsuarios)
 *  El controlador espera { usu_dni } en el body de la petición DELETE.
 */
export async function deleteUser(usu_dni: string): Promise<MessageResponse> {
  const resp = await api.delete<MessageResponse>('/Eliminar', { data: { usu_dni } });
  return resp.data;
}