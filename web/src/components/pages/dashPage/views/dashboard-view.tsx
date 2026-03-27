import {
  Target,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CalendarDays,
  Crosshair,
} from "lucide-react"

import { SummaryCard } from "@/src/components/summaryCard"
import { MetaProjectionChart } from "@/src/components/projectionChart"
import { SectionsTable } from "@/src/components/sectionsTable"
import { useSelector } from "react-redux";
import dayjs from "dayjs"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import {
  countDaysWithoutSundays,
  getMetaEndDate,
  calculateMonthlyProjection
} from "@/src/lib/utils"

dayjs.extend(isSameOrBefore)
dayjs.extend(utc)
dayjs.extend(timezone)

dayjs.tz.setDefault("America/Sao_Paulo")

export default function DashboardView() {
  const { lojaAccount } = useSelector((state: any) => state.loja);

  // Calcular os dias da meta
  const startDate = lojaAccount?.dataInicio
    ? dayjs(lojaAccount.dataInicio).tz("America/Sao_Paulo")
    : null

  const today = dayjs().tz("America/Sao_Paulo")

  let daysPassed = 0
  let daysRemaining = 0

  if (startDate) {
    const endDate = getMetaEndDate(startDate)

    daysPassed = countDaysWithoutSundays(startDate, today)
    daysRemaining = countDaysWithoutSundays(today.add(1, "day"), endDate)
  }

  // Calcular a projeção da loja
  let projection = 0

  if (startDate) {
    const endDate = getMetaEndDate(startDate)
    const faturamentoAtual = Number(lojaAccount?.faturamento) || 0
  
    daysPassed = countDaysWithoutSundays(startDate, today)
    daysRemaining = countDaysWithoutSundays(today.add(1, "day"), endDate)
  
    projection = calculateMonthlyProjection({
      faturamentoAtual: faturamentoAtual ?? 0,
      diasPassados: daysPassed,
      diasRestantes: daysRemaining,
    })
  }

  // calcular a Diferença
  const diferenca = lojaAccount?.faturamento - lojaAccount?.meta

  const metaDiariaLoja = diferenca / daysRemaining
  
  // console.log("projection: ", projection)
  
  const summaryCards = [
    {
      title: "Meta do Mês",
      value: lojaAccount?.meta,
      description: "Objetivo definido",
      icon: Target,
      variant: "default",
      isCurrency: true,
    },
    {
      title: "Faturamento",
      value: lojaAccount?.faturamento,
      description: "Acumulado atual",
      icon: DollarSign,
      variant: "success",
      isCurrency: true,
    },
    {
      title: "Projeção",
      value: projection,
      description: "Estimativa mensal",
      icon: TrendingUp,
      variant: "success",
      isCurrency: true,
    },
    {
      title: "Diferença",
      value: diferenca,
      description: "Abaixo da meta",
      icon: AlertTriangle,
      variant: "warning",
      isCurrency: true,
    },
    {
      title: "Meta Diária",
      value: metaDiariaLoja,
      description: "Objetivo de venda diario da loja",
      icon: Crosshair,
      variant: "warning",
      isCurrency: true,
    },
    {
      title: "Dias de Meta",
      value: daysPassed,
      description: `Faltam ${daysRemaining} dias para fechar a meta`,
      icon: CalendarDays,
      variant: "warning",
      isCurrency: false, // 👈 aqui
    },
  ] as const

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6">
        {summaryCards.map((card, index) => (
          <SummaryCard key={index} {...card} />
        ))}
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm min-h-[360px]" data-tour="dashboard-grafico">
        <MetaProjectionChart />
      </div>

      <div className="rounded-xl border p-4 shadow-sm min-h-[360px]" data-tour="table-user">
        <SectionsTable />
      </div>

    </>
  )
}
