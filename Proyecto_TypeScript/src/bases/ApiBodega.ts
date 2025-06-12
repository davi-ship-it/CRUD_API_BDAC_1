// bases/ApiBodega.ts
import axios from 'axios';
import type { NewBodega, Bodega } from './BodegaTypes';

const api = axios.create({
  baseURL: 'http://localhost:3000/Bodega',
  timeout: 5000,
});

/** CREATE */
export async function createBodega(b: NewBodega): Promise<Bodega> {
  const resp = await api.post<{ message: string; bodega: Bodega }>('/registrar', b);
  return resp.data.bodega;
}

/** READ ALL */
export async function getBodegas(): Promise<Bodega[]> {
  const resp = await api.get<{ message: string; bodegas: Bodega[] }>('/listar');
  return resp.data.bodegas;
}

/** READ ONE */
export async function getBodega(id: number): Promise<Bodega> {
  const resp = await api.get<{ message: string; bodega: Bodega }>(`/buscar/${id}`);
  return resp.data.bodega;
}

/** UPDATE */
export async function updateBodega(id: number, b: NewBodega): Promise<Bodega> {
  const resp = await api.put<{ message: string; bodega: Bodega }>(`/actualizar/${id}`, b);
  return resp.data.bodega;
}

/** DELETE */
export async function deleteBodega(id: number): Promise<{ message: string }> {
  const resp = await api.delete<{ message: string }>(`/eliminar/${id}`);
  return resp.data;
}
