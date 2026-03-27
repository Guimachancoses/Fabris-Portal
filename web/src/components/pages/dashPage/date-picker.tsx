import { Calendar } from "@/src/components/ui/calendar"
import {
  SidebarGroup,
  SidebarGroupContent,
} from "@/src/components/ui/sidebar"
import { useSelector } from "react-redux"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import { useEffect, useState } from "react"

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault("America/Sao_Paulo")

export function DatePicker() {
  const { lojaAccount } = useSelector((state: any) => state.loja)
  const [range, setRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })

  useEffect(() => {
    if (!lojaAccount?.dataInicio) return

    const [y, m, d] = lojaAccount.dataInicio
      .split("T")[0]
      .split("-")
      .map(Number)

    const start = new Date(y, m - 1, d)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    setRange({
      from: start,
      to: today,
    })
  }, [lojaAccount?.dataInicio])

  if (!range.from || !range.to) return null

  const calendarKey = range.from
  ? range.from.toISOString()
  : "empty"


  // const startDate = new Date(year, month - 1, day)
  // const rangeEnd = new Date(startDate)
  // rangeEnd.setDate(rangeEnd.getDate() + 30)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // console.log("startDate: ", startDate)

  return (
    <SidebarGroup className="px-1">
      <SidebarGroupContent>
        <Calendar
          key={calendarKey}
          mode="range"
          selected={range}
          defaultMonth={today}
          onSelect={() => {}}        // impede alteração do range
          //fromMonth={range.from}    // trava navegação antes
          //toMonth={range.to}        // trava navegação depois
          showOutsideDays={false}
        />
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
