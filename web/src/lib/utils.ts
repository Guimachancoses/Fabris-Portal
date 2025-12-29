import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind class names, resolving any conflicts.
 *
 * @param inputs - An array of class names to merge.
 * @returns A string of merged and optimized class names.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function calcularPorcentagem(
  valorTabela: number,
  valorFinanceira: number
) {
  if (valorTabela <= 0) return 0

  const diferenca = valorTabela - valorFinanceira
  const porcentagem = (diferenca / valorTabela) * 100

  return Math.max(0, Math.min(100, Number(porcentagem.toFixed(2))))
}

const formatCurrencyBR = (value: string) => {
  const numeric = value.replace(/\D/g, "")
  const number = Number(numeric) / 100
  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

