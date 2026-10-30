import api from "@/api/axios";

export interface ZonaEntrega {
  zona_id: number;
  nombre_zona: string;
}

export const zonasService = {
  async listar(): Promise<ZonaEntrega[]> {
    const { data } = await api.get<ZonaEntrega[]>("/catalogo/zonas");
    return Array.isArray(data) ? data : [];
  },
};
