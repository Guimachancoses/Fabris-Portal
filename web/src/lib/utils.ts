import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import dayjs from "dayjs"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import Decimal from "decimal.js"

dayjs.extend(isSameOrBefore)
dayjs.extend(utc)
dayjs.extend(timezone)

dayjs.tz.setDefault("America/Sao_Paulo")

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

export function formatCurrencyBR(value: unknown): string {
  if (value === null || value === undefined) {
    return "0,00";
  }

  let numberValue: number;

  // 👉 Se já for number, NÃO divide por 100
  if (typeof value === "number") {
    numberValue = value;
  }
  // 👉 Se for string
  else if (typeof value === "string") {
    // Remove pontos de milhar e troca vírgula por ponto
    const normalized = value
      .replace(/\./g, "")
      .replace(",", ".");

    numberValue = Number(normalized);
  } else {
    return "0,00";
  }

  if (isNaN(numberValue)) {
    return "0,00";
  }

  return numberValue.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatCurrencyGR(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

export function formatPhoneBR(value?: string | number | null): string {
  if (!value) return "";

  const digits = String(value).replace(/\D/g, "").slice(0, 11);

  if (digits.length === 0) {
    return "";
  }

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function parseCurrencyBR(
  value?: string | number | null
): string {
  if (value === null || value === undefined) return "";

  const stringValue = String(value);

  const normalized = stringValue
    .replace(/\./g, "")   // remove separador de milhar
    .replace(",", ".")   // troca vírgula por ponto
    .replace(/[^0-9.]/g, "");

  if (!normalized) return "";

  // garante duas casas decimais SEM virar number
  const [int, dec = "00"] = normalized.split(".");

  return `${int}.${dec.padEnd(2, "0").slice(0, 2)}`;
}

export function onlyNumbers(value?: string | number | null): string {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\D/g, "");
}

export function generateSecureCode(length: number = 8): string {
  const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lowerCase = "abcdefghijklmnopqrstuvwxyz"
  const numbers = "0123456789"
  const specialChars = "!@#$%^&*()-_=+[]{}<>?"

  const allChars = upperCase + lowerCase + numbers + specialChars

  // Garante pelo menos 1 caractere de cada tipo
  const requiredChars = [
    upperCase[Math.floor(Math.random() * upperCase.length)],
    lowerCase[Math.floor(Math.random() * lowerCase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    specialChars[Math.floor(Math.random() * specialChars.length)],
  ]

  // Completa o restante dos caracteres
  const remainingLength = Math.max(length - requiredChars.length, 0)
  const result = [...requiredChars]

  for (let i = 0; i < remainingLength; i++) {
    result.push(allChars[Math.floor(Math.random() * allChars.length)])
  }

  // Embaralha o resultado (Fisher–Yates)
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[result[i], result[j]] = [result[j], result[i]]
  }

  return result.join("")
}

export function countDaysWithoutSundays(start: dayjs.Dayjs, end: dayjs.Dayjs) {
  let count = 0
  let current = start.startOf("day")

  while (current.isSameOrBefore(end, "day")) {
    // day(): 0 = domingo
    if (current.day() !== 0) {
      count++
    }
    current = current.add(1, "day")
  }

  return count
}

export function getMetaEndDate(startDate: dayjs.Dayjs) {
  let end: dayjs.Dayjs

  if (startDate.date() >= 20) {
    // fecha dia 20 do próximo mês
    end = startDate.add(1, "month").date(20)
  } else {
    // fecha dia 20 do mesmo mês
    end = startDate.date(20)
  }

  // Se dia 20 cair em domingo, volta para o sábado
  if (end.day() === 0) {
    end = end.subtract(1, "day")
  }

  return end.endOf("day")
}

export function calculateMonthlyProjection({
  faturamentoAtual,
  diasPassados,
  diasRestantes,
}: {
  faturamentoAtual: number
  diasPassados: number
  diasRestantes: number
}) {
  if (!faturamentoAtual || diasPassados <= 0) {
    return 0
  }

  const mediaDiaria = faturamentoAtual / diasPassados
  const projecao = faturamentoAtual + mediaDiaria * diasRestantes

  return Math.round(projecao)
}

export function calcularDesconto(
  tabela2: number,
  entrada: number,
  porcentagemDesconto: number,
  porcentagemDesconto2: number,
  porcentagemDescontoParcelado: number
) {
  const tabela = new Decimal(tabela2)
  const entradaDecimal = new Decimal(entrada)

  const d1 = new Decimal(porcentagemDesconto).div(100)
  const dX = new Decimal(porcentagemDesconto2).div(100)
  const d2 = new Decimal(porcentagemDescontoParcelado).div(100)

  if (tabela.lte(0)) {
    return { percentual: 0, soma: 0 }
  }

  const fator1 = new Decimal(1).minus(d1)
  const fatorX = new Decimal(1).minus(dX)
  const fator2 = new Decimal(1).minus(d2)

  if (fator1.lte(0) || fator2.lte(0)) {
    return { percentual: 0, soma: 0 }
  }

  const fatorEntrada = fator1.times(fatorX)

  if (fatorEntrada.lte(0)) {
    return { percentual: 0, soma: 0 }
  }

  const x = entradaDecimal.div(fatorEntrada)
  const diff1 = tabela.minus(x)
  const diff2 = diff1.times(fator2)

  const soma = diff2.plus(entradaDecimal)

  const final = tabela.minus(soma)
  const resultado = final.div(tabela).times(100)

  return {
    percentual: Number(resultado.toDecimalPlaces(2, Decimal.ROUND_HALF_UP)),
    soma: Number(soma.toDecimalPlaces(2, Decimal.ROUND_HALF_UP)),
  }
}