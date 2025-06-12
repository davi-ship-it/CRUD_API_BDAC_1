// src/bases/UserTypes.ts

export interface NewUser {
  usu_nombres:   string;
  usu_apellidos: string;
  usu_password:  string;
  usu_telefono:  string;
  usu_correo:    string;
  usu_rol:       string;
  usu_dni:       string;
}

// Para las operaciones que incluyen el ID y devuelven todo el usuario:
export interface User extends NewUser {
  id: string;      // o number, según tu backend
}

// Respuesta genérica de mensajes:
export interface MessageResponse {
  message: string;
}
