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

export const menuService = {
  async obtenerMenuHoy(): Promise<MenuDelDia | null> {
    const { data } = await api.get<MenuDelDia | null>("/catalogo/menu-hoy");
    return data;
  },

  async listarAdmin(): Promise<MenuAdmin[]> {
    const { data } = await api.get<MenuAdmin[]>("/admin/menu");
    return Array.isArray(data) ? data : [];
  },

  async crear(payload: CrearMenuPayload): Promise<MenuAdmin> {
    const { data } = await api.post<MenuAdmin>("/admin/menu", payload);
    return data;
  },

  async actualizar(id: number, payload: ActualizarMenuPayload): Promise<MenuAdmin> {
    const { data } = await api.put<MenuAdmin>(`/admin/menu/${id}`, payload);
    return data;
  },
};
