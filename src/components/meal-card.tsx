import { Clock3, Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatMoney } from "@/components/ui-primitives"
import type { Meal } from "@/types"

export function MealCard({
  meal,
  onAdd,
}: {
  meal: Meal
  onAdd: (meal: Meal) => void
}) {
  return (
    <article className={`meal-card${meal.available ? "" : " meal-card-unavailable"}`}>
      <div className="meal-image-wrap">
        <img
          alt={meal.name}
          className="meal-image"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null
            event.currentTarget.src = "/images/solandre-hero.png"
          }}
          src={meal.image}
        />
        {meal.badge && (
          <span className="meal-badge">
            <Sparkles aria-hidden="true" />
            {meal.badge}
          </span>
        )}
        {!meal.available && <span className="sold-out-badge">No disponible hoy</span>}
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
        <div className="meal-card-footer">
          <span className="meal-price">{formatMoney(meal.price)}</span>
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
  )
}
