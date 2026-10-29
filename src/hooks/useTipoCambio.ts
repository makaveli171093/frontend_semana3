import { useEffect, useState } from "react";
import { obtenerBsPorDolar } from "@/services/tipoCambio";

export function useTipoCambio() {
  const [bsPorDolar, setBsPorDolar] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    obtenerBsPorDolar()
      .then((tasa) => {
        if (activo) {
          setBsPorDolar(tasa);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (activo) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo obtener el tipo de cambio",
          );
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  return { bsPorDolar, error, cargando };
}
