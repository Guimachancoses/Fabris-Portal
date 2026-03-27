'use client'

import { useSelector } from "react-redux"
import { useClerk } from "@clerk/nextjs"
import { useMemo } from "react"


export type Section = {
  id: number
  header: string
  meta: number | null
  target: number | null
  limit: number | null
  reviewer?: string
}

export type Period = "daily" | "monthly" | "yearly"



export function useSectionsByPeriod(): Record<Period, Section[]> {
  const { user } = useClerk()
  const userEmail = user?.primaryEmailAddress?.emailAddress

  const { colaboradores } = useSelector((state: any) => state.colaborador)

  return useMemo(() => {
    const colaboradoresProcessados = colaboradores
      .filter((colaborador: any) => {

        if (colaborador.funcao === "Admin") {
          return false
        }

        return true
      })
      .map((colaborador: any, index: number) => ({
        id: index + 1,
        header: `${colaborador.nome} ${colaborador.sobrenome}`,
        meta: colaborador.meta ?? "",
        faturamento: colaborador.faturamento ?? "",
        target: "",
        limit: "",
        reviewer: "",
      }))

    return {
      daily: colaboradoresProcessados,
      monthly: colaboradoresProcessados,
      yearly: colaboradoresProcessados,
    }
  }, [colaboradores, userEmail])
}

