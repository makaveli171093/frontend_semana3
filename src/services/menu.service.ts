import api from "@/api/axios";

export interface ComponenteMenu {
  plato_id: number;
  nombre: string;
  descripcion: string | null;
  tipo: string;
}

export interface MenuDelDia {
  menu_dia_id: number;
  fecha: string;
  precio_menu: string | number;
  cantidad_disponible: number;
  publicado: boolean;
  info_nutricional: string | null;
  imagen_url: string | null;
  plato_principal: ComponenteMenu;
  bebida: ComponenteMenu;
  postre: ComponenteMenu;
}

export interface MenuAdmin {
  menu_dia_id: number;
  fecha: string;
  plato_principal_id: number;
  bebida_id: number;
  postre_id: number;
  cantidad_disponible: number;
  precio_menu: string | number;
  imagen_url: string | null;
  publicado: boolean;
  info_nutricional?: string | null;
}

export interface CrearMenuPayload {
  fecha: string;
  plato_principal_id: number;
  bebida_id: number;
  postre_id: number;
  info_nutricional: string;
  imagen_url: string;
  cantidad_disponible: number;
  precio_menu: number;
  publicado: boolean;
}

export interface ActualizarMenuPayload {
  cantidad_disponible: number;
  precio_menu: number;
  imagen_url: string;
  publicado: boolean;
}

// Obtiene la fecha actual respetando la zona horaria de Bolivia.
function obtenerFechaBolivia(): string {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/La_Paz",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const valores = Object.fromEntries(
    partes.map(({ type, value }) => [type, value]),
  );

  return `${valores.year}-${valores.month}-${valores.day}`;
}

export const menuService = {
  async obtenerMenuHoy(): Promise<MenuDelDia | null> {
    const fechaHoy = obtenerFechaBolivia();

    try {
      const { data } = await api.get<MenuDelDia>(`/catalogo/menu/${fechaHoy}`);

      // No mostrar menús que no estén publicados o no tengan stock.
      if (!data || !data.publicado || data.cantidad_disponible <= 0) {
        return null;
      }

      return data;
    } catch (error) {
      // Si no existe menú para esa fecha, la API puede responder 404.
      // Los demás errores se propagan para no ocultar fallos del servidor.
      throw error;
    }
  },

  async listarAdmin(): Promise<MenuAdmin[]> {
    const { data } = await api.get<MenuAdmin[]>("/admin/menu");
    return Array.isArray(data) ? data : [];
  },

  async crear(payload: CrearMenuPayload): Promise<MenuAdmin> {
    const { data } = await api.post<MenuAdmin>("/admin/menu", payload);
    return data;
  },

  async actualizar(
    id: number,
    payload: ActualizarMenuPayload,
  ): Promise<MenuAdmin> {
    const { data } = await api.put<MenuAdmin>(`/admin/menu/${id}`, payload);
    return data;
  },
};
