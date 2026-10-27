import api from "@/api/axios";

export type TipoPlato = "Principal" | "Acompanamiento" | "Bebida" | "Postre";

export interface IngredientePlato {
  ingrediente_id: number;
  nombre?: string;
}

export interface Plato {
  plato_id: number;
  nombre: string;
  descripcion: string | null;
  tipo: TipoPlato;
  imagen_url: string | null;
  ingredientes?: IngredientePlato[];
}

export interface PlatoPayload {
  nombre: string;
  tipo: TipoPlato;
  imagen_url?: string | null;
  descripcion?: string | null;
  ingredientes?: { ingrediente_id: number }[];
}

export const platosService = {
  async listarCatalogo(): Promise<Plato[]> {
    const { data } = await api.get<Plato[] | { value: Plato[]; Count: number }>(
      "/catalogo/platos",
    );

    return Array.isArray(data) ? data : data.value;
  },

  async listarAdmin(): Promise<Plato[]> {
    const { data } = await api.get<Plato[]>("/admin/platos");
    return data;
  },

  async obtener(id: number): Promise<Plato> {
    const { data } = await api.get<Plato>(`/admin/platos/${id}`);
    return data;
  },

  async crear(payload: PlatoPayload): Promise<Plato> {
    const { data } = await api.post<Plato>("/admin/platos", payload);
    return data;
  },

  async actualizar(id: number, payload: PlatoPayload): Promise<Plato> {
    const { data } = await api.put<Plato>(`/admin/platos/${id}`, payload);
    return data;
  },

  async eliminar(id: number): Promise<void> {
    await api.delete(`/admin/platos/${id}`);
  },
};
