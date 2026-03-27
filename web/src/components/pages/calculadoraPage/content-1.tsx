"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/src/components/ui/button"
import { GridPattern } from "@/src/components/ui/grid-pattern"
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
import { ShineBorder } from "@/src/components/ui/shine-border"
import { AnimatedGroup } from '@/src/components/ui/animated-group'
import { AuroraText } from "@/src/components/ui/aurora-text"
import { Highlighter } from "@/src/components/ui/highlighter"
import { useEffect, useState } from "react"

import { calcularDesconto, calcularPorcentagem } from "@/src/lib/utils"
import { CircularProgress } from "@/src/components/pages/calculadoraPage/circularProgressbar"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover"
import { Settings } from "lucide-react"

const JurosSchema = z.object({
    tabela: z.string().min(1),
    financeira: z.string().min(1),
})

const DescontoSchema = z.object({
    tabela2: z.string().min(1),
    entrada: z.string().min(1),
})

export default function ContentSection() {
    const [value, setValue] = useState(0)
    const [showHighlight, setShowHighlight] = useState(false)
    const [discountPercent, setDiscountPercent] = useState("43,87") // usado no cálculo
    const [discountPercent2, setDiscountPercent2] = useState("0") // usado no cálculo
    const [discountPercentParcelado, setDiscountPercentParcelado] = useState("37,63") // usado no cálculo
    const [tempDiscount, setTempDiscount] = useState(discountPercent) // edição no popover
    const [tempDiscount2, setTempDiscount2] = useState(discountPercent2) // edição no popover
    const [tempDiscountParcelado, setTempDiscountParcelado] = useState(discountPercentParcelado) // edição no popover
    const [openPopover, setOpenPopover] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowHighlight(true)
        }, 2000)

        return () => clearTimeout(timer)
    }, [])


    const formJuros = useForm<z.infer<typeof JurosSchema>>({
        resolver: zodResolver(JurosSchema),
        defaultValues: {
            tabela: "",
            financeira: "",
        },
    })

    const formDesconto = useForm<z.infer<typeof DescontoSchema>>({
        resolver: zodResolver(DescontoSchema),
        defaultValues: {
            tabela2: "",
            entrada: "",
        },
    })

    // FUNÇÃO PARA CONVERTER DE VOLTA PARA NUMBER
    const parseCurrency = (value: string) =>
        Number(value.replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, ""))

    const onSubmitJuros = (data: z.infer<typeof JurosSchema>) => {
        const tabela = parseCurrency(data.tabela)
        const financeira = parseCurrency(data.financeira)

        const resultado = calcularPorcentagem(tabela, financeira)

        setValue(0)
        setTimeout(() => setValue(resultado), 100)
    }

    const onSubmitDesconto = (data: z.infer<typeof DescontoSchema>) => {
        const tabela = parseCurrency(data.tabela2)
        const entrada = parseCurrency(data.entrada)
        const porcentagemDesconto = parseFloat(discountPercent.replace(",", "."))
        const porcentagemDesconto2 = parseFloat(discountPercent2.replace(",", "."))
        const porcentagemDescontoParcelado = parseFloat(discountPercentParcelado.replace(",", "."))

        const resultado = calcularDesconto(tabela, entrada, porcentagemDesconto, porcentagemDesconto2, porcentagemDescontoParcelado)


        console.log("tabela: ", tabela)
        console.log("entrada: ", entrada)
        console.log("porcentagemDesconto: ", porcentagemDesconto)
        console.log("porcentagemDesconto2: ", porcentagemDesconto2)
        console.log("porcentagemDescontoParcelado: ", porcentagemDescontoParcelado)
        console.log("resultado: ", resultado)
        setValue(0)
        setTimeout(() => setValue(resultado), 100)
    }

    return (
        <section id="scroll-container" className="fixed inset-0 z-0 bg-white dark:bg-black overflow-auto">
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
                        <h2 className="text-balance text-4xl font-semibold lg:text-5xl"><AuroraText>Cálculo de Percentual</AuroraText></h2>
                        <p className="mt-4">
                            Informe os valores{" "}
                            {showHighlight ? (
                                <Highlighter action="underline" color="#FF9800">
                                    totais de tabela
                                </Highlighter>
                            ) : (
                                <span>totais de tabela</span>
                            )}
                            {" "}e da{" "}
                            {showHighlight ? (
                                <Highlighter action="highlight" color="#87CEFA">
                                    financeira
                                </Highlighter>
                            ) : (
                                <span>financeira</span>
                            )}
                            {" "}para calcular o percentual de juros por item.</p>
                    </div>

                    <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 md:px-20 pt-6 pb-24">
                        <div className="flex flex-col md:flex-row md:justify-center md:items-center gap-12">
                            {/* LEFT — Form Card */}
                            <Card className="relative w-full max-w-full sm:max-w-lg md:max-w-md overflow-hidden shadow-lg">
                                <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />

                                <div className="relative z-10 p-4 sm:p-6">
                                    <Tabs defaultValue="juros" className="w-full">

                                        {/* Tabs header */}
                                        <TabsList className="grid w-full grid-cols-2 mb-6">
                                            <TabsTrigger value="juros" onClick={() => { formDesconto.reset(); setValue(0); }}>Financeira</TabsTrigger>
                                            <TabsTrigger value="desconto" onClick={() => { formJuros.reset(); setValue(0); }}>Desconto à vista</TabsTrigger>
                                        </TabsList>

                                        {/* TAB 1 - JUROS */}
                                        <TabsContent value="juros" className="transition-all duration-300">
                                            <Form {...formJuros}>
                                                <form onSubmit={formJuros.handleSubmit(onSubmitJuros)} className="space-y-6">

                                                    <FormField
                                                        control={formJuros.control}
                                                        name="tabela"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Valor Total de Tabela</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="text"
                                                                        inputMode="decimal"
                                                                        placeholder="R$ 0,00"
                                                                        value={field.value}
                                                                        onChange={(e) => {
                                                                            const raw = e.target.value.replace(/\D/g, "")
                                                                            const number = Number(raw) / 100

                                                                            field.onChange(
                                                                                `R$ ${number.toLocaleString("pt-BR", {
                                                                                    minimumFractionDigits: 2,
                                                                                })}`
                                                                            )
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={formJuros.control}
                                                        name="financeira"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Valor Total da Financeira</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="text"
                                                                        inputMode="decimal"
                                                                        placeholder="R$ 0,00"
                                                                        value={field.value}
                                                                        onChange={(e) => {
                                                                            const raw = e.target.value.replace(/\D/g, "")
                                                                            const number = Number(raw) / 100

                                                                            field.onChange(
                                                                                `R$ ${number.toLocaleString("pt-BR", {
                                                                                    minimumFractionDigits: 2,
                                                                                })}`
                                                                            )
                                                                        }}
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
                                                                formJuros.reset()
                                                                setValue(0)
                                                            }}
                                                        >
                                                            Limpar
                                                        </Button>
                                                        <Button type="submit">Calcular</Button>
                                                    </div>

                                                </form>
                                            </Form>
                                        </TabsContent>

                                        {/* TAB 2 - DESCONTO */}
                                        <TabsContent value="desconto" className="transition-all duration-300">
                                            <Form {...formDesconto}>
                                                <form onSubmit={formDesconto.handleSubmit(onSubmitDesconto)} className="space-y-6">
                                                    <div className="flex w-full justify-between items-end gap-2">
                                                        {/* VALOR TOTAL DE TABELA */}
                                                        <FormField
                                                            control={formDesconto.control}
                                                            name="tabela2"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Valor Total de Tabela</FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            inputMode="decimal"
                                                                            placeholder="R$ 0,00"
                                                                            value={field.value}
                                                                            onChange={(e) => {
                                                                                const raw = e.target.value.replace(/\D/g, "") // só números

                                                                                const number = Number(raw) / 100

                                                                                field.onChange(
                                                                                    `R$ ${number.toLocaleString("pt-BR", {
                                                                                        minimumFractionDigits: 2,
                                                                                    })}`
                                                                                )
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        {/* POPOVER CONFIG */}
                                                        <Popover open={openPopover} onOpenChange={setOpenPopover}>
                                                            <PopoverTrigger asChild>
                                                                <Button variant="outline" size="icon">
                                                                    <Settings className="w-4 h-4" />
                                                                </Button>
                                                            </PopoverTrigger>

                                                            <PopoverContent
                                                                align="end"
                                                                side="bottom"
                                                                sideOffset={8}
                                                                className="w-56"
                                                            >
                                                                <div className="space-y-3">

                                                                    <label className="text-sm font-medium">% Desconto à vista 1</label>

                                                                    <Input
                                                                        value={tempDiscount}
                                                                        onChange={(e) => setTempDiscount(e.target.value)}
                                                                    />

                                                                    <label className="text-sm font-medium">% Desconto à vista 2</label>

                                                                    <Input
                                                                        value={tempDiscount2}
                                                                        onChange={(e) => setTempDiscount2(e.target.value)}
                                                                    />

                                                                    <label className="text-sm font-medium">% Desconto parcelado</label>

                                                                    <Input
                                                                        value={tempDiscountParcelado}
                                                                        onChange={(e) => setTempDiscountParcelado(e.target.value)}
                                                                    />

                                                                    <Button
                                                                        size="sm"
                                                                        className="w-full"
                                                                        onClick={() => {
                                                                            const value = parseFloat(tempDiscount.replace(",", "."))

                                                                            if (isNaN(value) || value < 0 || value > 100) {
                                                                                return alert("Informe uma porcentagem válida (0 a 100)")
                                                                            }

                                                                            setDiscountPercent(tempDiscount)
                                                                            setDiscountPercent2(tempDiscount2)
                                                                            setDiscountPercentParcelado(tempDiscountParcelado)
                                                                            setOpenPopover(false)
                                                                        }}
                                                                    >
                                                                        Salvar
                                                                    </Button>

                                                                </div>
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                    <FormField
                                                        control={formDesconto.control}
                                                        name="entrada"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Valor de Entrada do Cliente</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="text"
                                                                        inputMode="decimal"
                                                                        placeholder="R$ 0,00"
                                                                        value={field.value}
                                                                        onChange={(e) => {
                                                                            const raw = e.target.value.replace(/\D/g, "")
                                                                            const number = Number(raw) / 100

                                                                            field.onChange(
                                                                                `R$ ${number.toLocaleString("pt-BR", {
                                                                                    minimumFractionDigits: 2,
                                                                                })}`
                                                                            )
                                                                        }}
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
                                                                formDesconto.reset()
                                                                setValue(0)
                                                            }}
                                                        >
                                                            Limpar
                                                        </Button>
                                                        <Button type="submit">Calcular</Button>
                                                    </div>

                                                </form>
                                            </Form>
                                        </TabsContent>

                                    </Tabs>
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
                                        <CardTitle>Total Do Percentual Por Item</CardTitle>
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
