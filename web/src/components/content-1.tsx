"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "./ui/button"
import { GridPattern } from "./ui/grid-pattern"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/src/components/ui/form"
import { Input } from "@/src/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { ShineBorder } from "./ui/shine-border"
import { AnimatedGroup } from '@/src/components/ui/animated-group'
import { useState } from "react"

import { calcularPorcentagem } from "@/src/lib/utils"
import { CircularProgress } from "./circularProgressbar"

const FormSchema = z.object({
    tabela: z.string().min(1, "Informe o valor de tabela"),
    financeira: z.string().min(1, "Informe o valor da financeira"),
})

export default function ContentSection() {
    const [value, setValue] = useState(0)

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            tabela: "",
            financeira: "",
        },
    })

    // FUNÇÃO PARA FORMATAR INPUT EM MOEDA BR
    const formatCurrencyBR = (value: string) => {
        const numeric = value.replace(/\D/g, "")
        const number = Number(numeric) / 100
        return number.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        })
    }

    // FUNÇÃO PARA CONVERTER DE VOLTA PARA NUMBER
    const parseCurrency = (value: string) =>
        Number(value.replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, ""))

    const onSubmit = (data: z.infer<typeof FormSchema>) => {
        const tabela = parseCurrency(data.tabela)
        const financeira = parseCurrency(data.financeira)

        const resultado = calcularPorcentagem(tabela, financeira)

        setValue(0)
        setTimeout(() => setValue(resultado), 100)
    }

    return (
        <section className="fixed inset-0 z-0 bg-white dark:bg-black overflow-auto">
            {/* Background grid */}
            <GridPattern
                squares={[
                    [4, 4],
                    [5, 1],
                    [8, 2],
                    [5, 3],
                    [5, 5],
                ]}
                className="absolute inset-0 h-full w-full text-black/40"
            />

            <AnimatedGroup
                variants={{
                    container: {
                        visible: {
                            transition: {
                                delayChildren: 1,
                            },
                        },
                    },
                    item: {
                        hidden: {
                            opacity: 0,
                            y: 20,
                        },
                        visible: {
                            opacity: 1,
                            y: 0,
                            transition: {
                                type: 'spring',
                                bounce: 0.3,
                                duration: 2,
                            },
                        },
                    },
                }}
                className="absolute inset-0 top-16 lg:top-6">

                {/* Conteúdo */}
                <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-20 pt-5 pb-24 overflow-auto min-h-full">
                    <div className="@container mx-auto max-w-5xl pt-12 text-center">
                        <h2 className="text-balance text-4xl font-semibold lg:text-5xl">Cálculo de Percentual</h2>
                        <p className="mt-4">Informe os valores totais de tabela e da financeira para calcular o percentual de juros por item.</p>
                    </div>

                    <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 md:px-20 pt-6 pb-24">
                        <div className="flex flex-col md:flex-row md:justify-center md:items-center gap-12">
                            {/* LEFT — Form Card */}
                            <Card className="relative w-full max-w-full sm:max-w-lg md:max-w-md overflow-hidden shadow-lg">
                                <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
                                <div className="relative z-10 flex justify-center p-4 sm:p-6">
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-sm space-y-6">
                                            <FormField
                                                control={form.control}
                                                name="tabela"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Valor Total de Tabela</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="R$ 0,00"
                                                                value={field.value}
                                                                onChange={(e) => field.onChange(formatCurrencyBR(e.target.value))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="financeira"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Valor Total da Financeira</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="R$ 0,00"
                                                                value={field.value}
                                                                onChange={(e) => field.onChange(formatCurrencyBR(e.target.value))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        form.reset();   // limpa os inputs
                                                        setValue(0);    // reseta a progress bar
                                                    }}
                                                >
                                                    Limpar
                                                </Button>
                                                <Button type="submit">Calcular</Button>
                                            </div>
                                        </form>
                                    </Form>
                                </div>
                            </Card>

                            {/* SEPARATOR */}
                            <div
                                className="hidden md:block h-90 w-[4px] rounded"
                                style={{
                                    background: "linear-gradient(to bottom, #A07CFE, #FE8FB5, #FFBE7B)",
                                    opacity: 0.7, // opacidade do gradiente
                                }}
                            />


                            {/* RIGHT — Card */}
                            <Card className="w-full max-w-sm sm:max-w-md shadow-lg relative overflow-hidden">
                                <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
                                <div className="relative z-10 w-full p-4 sm:p-6">
                                    <CardHeader className="text-center">
                                        <CardTitle>Total De Porcentagem Por Item</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex flex-col items-center justify-center gap-6">
                                        <CircularProgress value={value || 0} size={140} strokeWidth={12} />
                                    </CardContent>
                                </div>
                            </Card>

                        </div>
                    </div>
                </div>
            </AnimatedGroup>
        </section>
    )
}
