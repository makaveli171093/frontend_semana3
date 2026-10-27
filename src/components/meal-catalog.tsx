import { useMemo, useState } from "react"
import { Search, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MealCard } from "@/components/meal-card"
import { mealCategories } from "@/data/meal-categories"
import type { Meal } from "@/types"

export function MealCatalog({
  meals,
  onAdd,
}: {
  meals: Meal[]
  onAdd: (meal: Meal) => void
}) {
  const [category, setCategory] = useState<(typeof mealCategories)[number]>("Todos")
  const [search, setSearch] = useState("")

  const filteredMeals = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("es")
    return meals.filter((meal) => {
      const matchesCategory = category === "Todos" || meal.category === category
      const matchesSearch =
        !normalizedSearch ||
        `${meal.name} ${meal.description} ${meal.category}`
          .toLocaleLowerCase("es")
          .includes(normalizedSearch)
      return meal.available && matchesCategory && matchesSearch
    })
  }, [category, meals, search])

  return (
    <div className="catalog-controls-wrap">
      <div className="catalog-controls">
        <label className="search-field">
          <Search aria-hidden="true" />
          <span className="sr-only">Buscar en el menú</span>
          <input
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Busca un plato o ingrediente"
            type="search"
            value={search}
          />
          <span className="search-shortcut" aria-hidden="true"><SlidersHorizontal /></span>
        </label>
        <div aria-label="Filtrar por categoría" className="category-filters" role="group">
          {mealCategories.map((item) => (
            <Button
              aria-pressed={category === item}
              className="category-filter"
              key={item}
              onClick={() => setCategory(item)}
              size="sm"
              type="button"
              variant={category === item ? "default" : "outline"}
            >
              {item}
            </Button>
          ))}
        </div>
      </div>

      {filteredMeals.length ? (
        <div className="meal-grid">
          {filteredMeals.map((meal) => (
            <MealCard key={meal.id} meal={meal} onAdd={onAdd} />
          ))}
        </div>
      ) : (
        <div className="catalog-empty" role="status">
          <span className="catalog-empty-icon"><Search aria-hidden="true" /></span>
          <h3>{meals.length === 0 ? "El menú de hoy aún no está disponible" : "No encontramos ese plato"}</h3>
          <p>{meals.length === 0
            ? "La cocina todavía no publicó la oferta del día. Vuelve a consultar en unos minutos."
            : "Prueba con otra búsqueda o cambia la categoría elegida."}</p>
          {(search || category !== "Todos") && (
            <Button
              onClick={() => { setSearch(""); setCategory("Todos") }}
              size="sm"
              type="button"
              variant="outline"
            >
              Ver todo el menú
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
