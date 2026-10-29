import { useState } from "react";
import {
  Clock3,
  Plus,
  Sparkles,
  X,
  Utensils,
  CupSoda,
  CakeSlice,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/components/ui-primitives";
import type { Meal } from "@/types";
import { useTipoCambio } from "@/hooks/useTipoCambio";

export function MealCard({
  meal,
  onAdd,
}: {
  meal: Meal;
  onAdd: (meal: Meal) => void;
}) {
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const { bsPorDolar } = useTipoCambio();

  const precioUsd =
    bsPorDolar !== null && bsPorDolar > 0
      ? Number(meal.price) / bsPorDolar
      : null;
  return (
    <>
      <article
        className={`meal-card${meal.available ? "" : " meal-card-unavailable"}`}
      >
        <div className="meal-image-wrap">
          <img
            alt={meal.name}
            className="meal-image"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/images/solandre-hero.png";
            }}
            src={meal.image}
          />

          {meal.badge && (
            <span className="meal-badge">
              <Sparkles aria-hidden="true" />
              {meal.badge}
            </span>
          )}

          {!meal.available && (
            <span className="sold-out-badge">No disponible hoy</span>
          )}
        </div>

        <div className="meal-card-body">
          <div className="meal-card-meta">
            <span>{meal.category}</span>
            <span className="meal-time">
              <Clock3 aria-hidden="true" />
              {meal.prepTime} min
            </span>
          </div>

          <h3>{meal.name}</h3>
          <p>{meal.description}</p>

          <button
            type="button"
            onClick={() => setDetalleAbierto(true)}
            className="mt-3 text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            Ver qué incluye
          </button>

          <div className="meal-card-footer">
            <div className="meal-price-container">
              <span className="meal-price">{formatMoney(meal.price)}</span>

              {precioUsd !== null && (
                <span className="meal-price-usd">
                  ≈ USD{" "}
                  {precioUsd.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              )}
            </div>

            <Button
              aria-label={`Agregar ${meal.name} al pedido`}
              className="meal-add-button"
              disabled={!meal.available}
              onClick={() => onAdd(meal)}
              size="icon-lg"
              type="button"
              variant="default"
            >
              <Plus aria-hidden="true" />
            </Button>
          </div>
        </div>
      </article>

      {detalleAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setDetalleAbierto(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="detalle-menu-titulo"
            className="relative my-auto max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 text-gray-900 shadow-2xl sm:p-7"
          >
            <button
              type="button"
              onClick={() => setDetalleAbierto(false)}
              aria-label="Cerrar detalle del menú"
              className="absolute right-4 top-4 rounded-full p-2 hover:bg-gray-100"
            >
              <X size={20} aria-hidden="true" />
            </button>

            <img
              src={meal.image}
              alt={meal.name}
              className="mb-5 h-48 w-full rounded-xl object-cover"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/images/solandre-hero.png";
              }}
            />

            <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-primary">
              Menú del día
            </p>

            <h2 id="detalle-menu-titulo" className="pr-8 text-2xl font-bold">
              {meal.name}
            </h2>

            <p className="mt-2 text-xl font-bold text-primary">
              {formatMoney(meal.price)}
            </p>

            <div className="my-5 space-y-4">
              <div className="flex gap-3">
                <Utensils className="mt-1 shrink-0 text-primary" size={22} />
                <div>
                  <h3 className="font-semibold">Plato principal</h3>
                  <p>{meal.platoPrincipal ?? meal.name}</p>
                  {meal.platoPrincipalDescripcion && (
                    <p className="mt-1 whitespace-pre-line text-sm text-gray-600">
                      {meal.platoPrincipalDescripcion}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <CupSoda className="mt-1 shrink-0 text-primary" size={22} />
                <div>
                  <h3 className="font-semibold">Bebida</h3>
                  <p>{meal.bebida || "No especificada"}</p>
                  {meal.bebidaDescripcion && (
                    <p className="mt-1 whitespace-pre-line text-sm text-gray-600">
                      {meal.bebidaDescripcion}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <CakeSlice className="mt-1 shrink-0 text-primary" size={22} />
                <div>
                  <h3 className="font-semibold">Postre</h3>
                  <p>{meal.postre || "No especificado"}</p>
                  {meal.postreDescripcion && (
                    <p className="mt-1 whitespace-pre-line text-sm text-gray-600">
                      {meal.postreDescripcion}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {meal.cantidadDisponible !== undefined && (
              <p className="mb-4 text-sm text-gray-500">
                {meal.cantidadDisponible > 0
                  ? `${meal.cantidadDisponible} unidades disponibles`
                  : "Agotado"}
              </p>
            )}

            <Button
              type="button"
              className="w-full"
              disabled={!meal.available}
              onClick={() => {
                setDetalleAbierto(false);
                onAdd(meal);
              }}
            >
              <Plus size={18} aria-hidden="true" />
              Agregar al pedido
            </Button>
          </section>
        </div>
      )}
    </>
  );
}
