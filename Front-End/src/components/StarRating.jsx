import { Star } from "lucide-react";

// interactive=true -> clickable rating input (used in review form)
// interactive=false -> read-only display (used to show average rating)
const StarRating = ({ value = 0, onChange, interactive = false, size = 18 }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1">
      {stars.map((s) => (
        <button
          type="button"
          key={s}
          disabled={!interactive}
          onClick={() => interactive && onChange && onChange(s)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
          aria-label={`${s} star`}
        >
          <Star
            size={size}
            className={
              s <= Math.round(value)
                ? "fill-yellow-400 text-yellow-400"
                : "text-slate-300 dark:text-slate-600"
            }
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
