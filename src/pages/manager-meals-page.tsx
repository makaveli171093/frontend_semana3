import { useMemo, useState, type FormEvent } from "react";
import {
  Check,
  CirclePlus,
  Edit3,
  ImagePlus,
  Search,
  ToggleLeft,
  ToggleRight,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Modal,
  PageHeading,
  ToastNotice,
} from "@/components/ui-primitives";
import { useRestaurant } from "@/context/restaurant-context";
import type { Meal, MealCategory, MealDraft } from "@/types";

const categoryOptions: MealCategory[] = [
  "Platos principales",
  "Ensaladas y bowls",
  "Bebidas",
  "Postres",
];
const newMeal: MealDraft = {
  name: "",
  description: "",
  price: 0,
  category: "Platos principales",
  image: "",
  available: false,
  prepTime: 0,
};

export function ManagerMealsPage() {
  const { meals, saveMeal, toggleMealAvailability } = useRestaurant();
  const [query, setQuery] = useState("");
  const [availability, setAvailability] = useState<
    "TODOS" | "ACTIVOS" | "PAUSADOS"
  >("TODOS");
  const [editing, setEditing] = useState<MealDraft | null>(null);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const visibleMeals = useMemo(
    () =>
      meals.filter((meal) => {
        const matchesText = `${meal.name} ${meal.category}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesAvailability =
          availability === "TODOS" ||
          (availability === "ACTIVOS" ? meal.available : !meal.available);
        return matchesText && matchesAvailability;
      }),
    [availability, meals, query],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (saving || !editing) return;

    if (!editing.name.trim()) {
      setNotice("Completa el nombre del plato.");
      return;
    }

    const existing = Boolean(editing.id);

    try {
      setSaving(true);
      await saveMeal(editing);

      setEditing(null);
      setNotice(
        existing
          ? "El plato se actualizó correctamente."
          : "El plato se creó correctamente en el backend.",
      );
    } catch (error) {
      console.error("Error guardando el plato:", error);
      setNotice(
        "No se pudo guardar el plato. Verifica los datos y vuelve a intentarlo.",
      );
    } finally {
      setSaving(false);
    }
  };

  const updateDraft = <K extends keyof MealDraft>(
    key: K,
    value: MealDraft[K],
  ) => {
    setEditing((current) => (current ? { ...current, [key]: value } : current));
  };

  return (
    <div>
      <PageHeading
        description="Administra los datos básicos de los platos. El precio y la disponibilidad pertenecen al menú diario."
        eyebrow="La carta de Solandre"
        title="Menú y comidas"
        actions={
          <Button
            onClick={() => setEditing({ ...newMeal })}
            size="lg"
            type="button"
          >
            <CirclePlus aria-hidden="true" data-icon="inline-start" /> Nueva
            comida
          </Button>
        }
      />

      <section className="panel meal-management-panel">
        <div className="management-toolbar">
          <label className="search-field management-search">
            <Search aria-hidden="true" />
            <span className="sr-only">Buscar platos</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar comida…"
              type="search"
              value={query}
            />
          </label>
          <div
            aria-label="Filtrar por disponibilidad"
            className="availability-tabs"
            role="group"
          >
            {(["TODOS", "ACTIVOS", "PAUSADOS"] as const).map((item) => (
              <Button
                aria-pressed={availability === item}
                key={item}
                onClick={() => setAvailability(item)}
                size="sm"
                type="button"
                variant={availability === item ? "default" : "ghost"}
              >
                {item === "TODOS"
                  ? "Todos"
                  : item === "ACTIVOS"
                    ? "Disponibles"
                    : "Pausados"}
              </Button>
            ))}
          </div>
        </div>
        <div className="table-scroll">
          <table className="data-table meal-management-table">
            <thead>
              <tr>
                <th>Comida</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Preparación</th>
                <th>Disponibilidad</th>
                <th>
                  <span className="sr-only">Editar</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleMeals.map((meal) => (
                <tr key={meal.id}>
                  <td>
                    <div className="meal-table-cell">
                      <img alt="" src={meal.image} />
                      <div>
                        <strong>{meal.name}</strong>
                        <span>{meal.description}</span>
                      </div>
                    </div>
                  </td>
                  <td>{meal.category}</td>
                  <td><span>Se configura en menú diario</span></td>
                  <td><span>—</span></td>
                  <td>
                    <button
                      aria-label={`${meal.available ? "Pausar" : "Activar"} ${meal.name}`}
                      className={`availability-toggle${meal.available ? " is-available" : ""}`}
                      onClick={() => toggleMealAvailability(meal.id)}
                      disabled
                      title="La disponibilidad se administra desde el menú diario del backend"
                      type="button"
                    >
                      <span>
                        {meal.available ? (
                          <ToggleRight aria-hidden="true" />
                        ) : (
                          <ToggleLeft aria-hidden="true" />
                        )}
                      </span>
                      {meal.available ? "Disponible" : "Pausado"}
                    </button>
                  </td>
                  <td>
                    <Button
                      aria-label={`Editar ${meal.name}`}
                      onClick={() => setEditing({ ...meal })}
                      size="icon-sm"
                      type="button"
                      variant="ghost"
                    >
                      <Edit3 aria-hidden="true" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visibleMeals.length && (
            <div className="table-empty">
              <UtensilsCrossed aria-hidden="true" />
              <strong>No hay platos con estos filtros.</strong>
              <span>Prueba otro término o cambia la disponibilidad.</span>
            </div>
          )}
        </div>
        <div className="table-footer-note">
          <span>
            {visibleMeals.length} de {meals.length} platos
          </span>
          <span>
            <span className="table-green-dot" /> Disponibilidad del menú diario: integración pendiente
          </span>
        </div>
      </section>

      <Modal
        description="Esta operación guarda nombre, descripción, tipo e imagen en el catálogo. El precio y la disponibilidad se gestionan en el menú diario."
        onClose={() => setEditing(null)}
        open={Boolean(editing)}
        title={editing?.id ? "Editar comida" : "Nueva comida"}
        wide
      >
        {editing && (
          <form className="meal-editor-form" onSubmit={handleSubmit}>
            <div className="meal-editor-fields">
              <label className="form-field">
                <span>Nombre del plato</span>
                <input
                  autoFocus
                  onChange={(event) => updateDraft("name", event.target.value)}
                  placeholder="Ej. Silpancho de la casa"
                  required
                  value={editing.name}
                />
              </label>
              <label className="form-field">
                <span>Categoría</span>
                <select
                  onChange={(event) =>
                    updateDraft("category", event.target.value as MealCategory)
                  }
                  value={editing.category}
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field field-span-two">
                <span>Descripción</span>
                <textarea
                  onChange={(event) =>
                    updateDraft("description", event.target.value)
                  }
                  placeholder="Cuenta qué hace especial a este plato"
                  required
                  rows={3}
                  value={editing.description}
                />
              </label>
              <label className="form-field field-span-two">
                <span>URL de imagen</span>
                <span className="form-input-wrap">
                  <ImagePlus aria-hidden="true" />
                  <input
                    onChange={(event) =>
                      updateDraft("image", event.target.value)
                    }
                    placeholder="/images/solandre-hero.png"
                    type="text"
                    value={editing.image}
                  />
                </span>
              </label>
            </div>
            <div className="modal-footer form-footer">
              <Button
                onClick={() => setEditing(null)}
                type="button"
                variant="outline"
              >
                Cancelar
              </Button>
              <Button disabled={saving} type="submit">
                <Check aria-hidden="true" data-icon="inline-start" />
                {saving ? "Guardando..." : "Guardar comida"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
      <ToastNotice message={notice} onClose={() => setNotice("")} />
    </div>
  );
}
