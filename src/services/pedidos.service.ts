import api from "@/api/axios";

export type MetodoPago = "Efectivo" | "QR" | "Transferencia";

export type EstadoPedidoBackend =
  | "Pendiente"
  | "Confirmado"
  | "En Cocina"
  | "Listo para Entrega"
  | "En Reparto"
  | "Entregado"
  | "Cancelado";

export interface CrearPedidoPayload {
  zona_id: number;
  google_maps_link: string | null;
  latitud: number | null;
  longitud: number | null;
  direccion_referencia: string;
  metodo_pago: MetodoPago;
  items: {
    menu_dia_id: number;
    cantidad: number;
    exclusiones: number[];
  }[];
}

export interface PedidoCreado {
  pedido_id: number;
  token_recoger: string;
  estado: EstadoPedidoBackend;
  total_pedido: string;
  metodo_pago: MetodoPago;
  esta_pagado: boolean;
  zona_id: number;
  direccion_referencia: string;
  fecha_pedido: string;
}

export interface PedidoPendienteBackend {
  pedido_id: number;
  token_recoger: string;
  estado: EstadoPedidoBackend;
  fecha_pedido: string;
  cliente_nombre: string;
  cliente_telefono: string;
  items: {
    item_id: number;
    cantidad: number;
    menu_fecha: string;
    plato_principal: string;
    bebida: string;
    postre: string;
    exclusiones: unknown[];
  }[];
  minutos_desde_pedido: number;
}

export const pedidosService = {
  async crear(payload: CrearPedidoPayload): Promise<PedidoCreado> {
    const { data } = await api.post<PedidoCreado>("/pedidos/", payload);
    return data;
  },

  async listarPendientes(): Promise<PedidoPendienteBackend[]> {
    const { data } =
      await api.get<PedidoPendienteBackend[]>("/cocina/pendientes");
    return data;
  },

  async actualizarEstado(
    pedidoId: number,
    nuevoEstado: EstadoPedidoBackend,
  ): Promise<unknown> {
    const { data } = await api.patch(`/cocina/pedidos/${pedidoId}/estado`, {
      nuevo_estado: nuevoEstado,
    });
    return data;
  },
};
