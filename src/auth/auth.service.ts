import api from "@/api/axios";
import { loginSchema, registerSchema } from "@/auth/auth.schema";
import type { DemoUser, UserRole } from "@/types";

interface AuthResponse {
  access_token: string;
  token_type: string;
  usuario_id: number | string;
  rol_id: number | string;
  nombre_completo: string;
  email: string;
}

function mapRole(rolId: number | string): UserRole {
  switch (Number(rolId)) {
    case 1:
      return "GERENTE";
    case 2:
      return "COCINERO";
    case 4:
      return "CLIENTE";
    default:
      throw new Error(
        `El rol ${rolId} no tiene un panel habilitado en Solandre.`,
      );
  }
}

export function getApiErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (
      error as {
        response?: {
          data?: {
            detail?: string;
            message?: string;
          };
        };
      }
    ).response;

    const message = response?.data?.detail ?? response?.data?.message;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  if (error instanceof Error) {
    if (error.message.includes("Network Error")) {
      return "No se pudo conectar con el servidor. Intenta nuevamente.";
    }

    return error.message;
  }

  return "Ocurrió un error inesperado. Intenta nuevamente.";
}

export async function loginRequest(email: string, password: string) {
  const credentials = loginSchema.parse({ email, password });

  const { data } = await api.post<AuthResponse>("/auth/login", credentials);

  if (!data.access_token) {
    throw new Error("El servidor no devolvió un token de acceso.");
  }

  const user: DemoUser = {
    id: String(data.usuario_id),
    name: data.nombre_completo,
    email: data.email,
    role: mapRole(data.rol_id),
  };

  return {
    user,
    token: data.access_token,
  };
}

export async function registerRequest(
  nombreCompleto: string,
  email: string,
  password: string,
  telefono: string,
) {
  const payload = registerSchema.parse({
    nombre_completo: nombreCompleto,
    email,
    password,
    telefono,
  });

  await api.post("/auth/register", payload);
}
