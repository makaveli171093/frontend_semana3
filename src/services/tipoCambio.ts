const API_URL = "https://open.er-api.com/v6/latest/USD";

interface TipoCambioResponse {
  result: string;
  rates: {
    BOB: number;
  };
}

export async function obtenerBsPorDolar(): Promise<number> {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("No se pudo consultar el tipo de cambio");
  }

  const data: TipoCambioResponse = await response.json();

  if (data.result !== "success" || !data.rates.BOB) {
    throw new Error("Tipo de cambio no disponible");
  }

  return data.rates.BOB;
}
