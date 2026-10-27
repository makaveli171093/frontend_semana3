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

export const menuService = {
  async obtenerMenuHoy(): Promise<MenuDelDia | null> {
    const { data } = await api.get<MenuDelDia | null>("/catalogo/menu-hoy");

    return data;
  },
};
