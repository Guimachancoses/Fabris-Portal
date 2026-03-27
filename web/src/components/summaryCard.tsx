import { cn } from "@/src/lib/utils"
import CountUp from "react-countup"

type SummaryCardProps = {
  title: string
  value: number
  description: string
  icon: React.ElementType
  variant?: "default" | "success" | "warning"
  isCurrency?: boolean
}

export function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  variant = "default",
  isCurrency = true,
}: SummaryCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 shadow-sm transition hover:shadow-md",
        variant === "success" && "border-emerald-500/30",
        variant === "warning" && "border-amber-500/30"
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>

        <Icon
          className={cn(
            "h-5 w-5",
            variant === "success" && "text-emerald-500",
            variant === "warning" && "text-amber-500"
          )}
        />
      </div>

      <div className="mt-3 text-2xl font-semibold">
        <p className="mt-3 text-2xl font-semibold">
          <CountUp
            end={value}
            duration={1.2}
            separator={isCurrency ? "." : ""}
            decimal={isCurrency ? "," : ""}
            prefix={isCurrency ? "R$ " : ""}
          />
        </p>
      </div>

      {description && (
        <p className="mt-1 text-xs text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  )
}
