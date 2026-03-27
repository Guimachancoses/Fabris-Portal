"use client"

import { useEffect, useState } from "react"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

import {
    Button,
    Drawer,
    Stack,
    Typography,
    TextField,
    InputAdornment,
} from "@mui/material"

import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"

import { ArrowRight, ChartSpline, ChevronRight } from "lucide-react"

import { cn, formatCurrencyBR, parseCurrencyBR } from "@/src/lib/utils"
import { useDispatch, useSelector } from "react-redux"
import { allUpdateLoja, updateLoja } from "../store/modules/loja/actions"
import { toast } from "sonner"
import { AnimatedGradientText } from "./ui/animated-gradient-text"

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault("America/Sao_Paulo")

export function SheetComponent() {
    const dispatch = useDispatch()
    const [open, setOpen] = useState(false)
    const [metaInput, setMetaInput] = useState("")
    const [faturamentoInput, setFaturamentoInput] = useState("")
    const [dataInicioInput, setDataInicioInput] = useState<dayjs.Dayjs | null>(null)
    const { lojaAccount, loja, form } = useSelector((state: any) => state.loja)
    const hasMetaConfigurada = Boolean(lojaAccount?.dataInicio) || Boolean(lojaAccount?.meta)
    const [errors, setErrors] = useState({
        dataInicio: false,
        meta: false,
        faturamento: false,
    })

    useEffect(() => {
        if (open && lojaAccount?.meta) {
            setMetaInput(formatCurrencyBR(lojaAccount.meta))
        }
        if (open && lojaAccount?.dataInicio) {
            setDataInicioInput(
                dayjs(lojaAccount.dataInicio.split("T")[0])
            )
        }
        if (open && lojaAccount?.faturamento) {
            setFaturamentoInput(formatCurrencyBR(lojaAccount.faturamento))
        }
    }, [open, lojaAccount?.meta, lojaAccount?.dataInicio])

    const validateFields = () => {
        const newErrors: any = {}

        if (!dataInicioInput) newErrors.dataInicio = true
        if (!metaInput || metaInput === "0,00") newErrors.meta = true
        if (!faturamentoInput || faturamentoInput === "0,00") newErrors.faturamento = true

        setErrors(newErrors)

        return Object.keys(newErrors).length === 0
    }

    const requiredFields = () => {
        if (!dataInicioInput) return "Data de início é obrigatória"
        if (!metaInput || metaInput === "0,00") return "Meta é obrigatória"
        if (!faturamentoInput || faturamentoInput === "0,00") return "Faturamento é obrigatório"
        return null
    }

    const handleSubmit = () => {
        const errorMessage = requiredFields()
        const isValid = validateFields()

        if (errorMessage && !isValid) {
            toast.error("Preencha os campos obrigatórios", {
                description: errorMessage,
            })
            return
        }

        dispatch(
            updateLoja({
                loja: {
                    ...loja,
                    dataInicio: dataInicioInput?.toISOString(),
                    meta: parseCurrencyBR(metaInput),
                    faturamento: parseCurrencyBR(faturamentoInput),
                },
            })
        )
        setTimeout(() => {
            dispatch(allUpdateLoja());
        }, 1000)

        setOpen(false)
    }

    return (
        <>
            <button
                data-tour="ajustar-meta"
                onClick={() => setOpen(true)}
            >
                <div className="
                    relative
                    overflow-hidden
                    bg-white
                    text-foreground
                    group
                    mx-auto
                    flex
                    w-fit
                    items-center
                    gap-4
                    rounded-full
                    border
                    p-1
                    pl-4
                    shadow-md
                    shadow-zinc-950/5
                    transition-all
                    duration-300
                    hover:bg-primary/10
                    dark:bg-background
                    dark:hover:bg-primary/20
                    "
                >
                    <span
                        className={cn(
                            "animate-gradient absolute inset-0 block h-full w-full rounded-[inherit] bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-[length:300%_100%] p-[1px]"
                        )}
                        style={{
                            WebkitMask:
                                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                            WebkitMaskComposite: "destination-out",
                            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                            maskComposite: "subtract",
                            WebkitClipPath: "padding-box",
                        }}
                    />
                    <ChartSpline
                        className="
                        h-4 w-4
                        text-muted-foreground
                        transition-colors
                        group-hover:text-primary
                        "
                    />
                    <hr
                        className="
                        mx-2 
                        h-4 
                        w-px 
                        shrink-0 
                        bg-neutral-500
                        text-muted-foreground
                        transition-colors
                        group-hover:bg-primary
                        "
                    />
                    <AnimatedGradientText className="text-sm font-medium">
                        Ajustar Meta da Loja
                    </AnimatedGradientText>
                    <hr
                        className="
                        mx-2 
                        h-4 
                        w-px 
                        shrink-0 
                        bg-neutral-500
                        text-muted-foreground
                        transition-colors
                        group-hover:bg-primary
                    "
                    />
                <div className="bg-primary/90 text-white group-hover:bg-white dark:group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500 mx-1">
                        <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                            <span className="flex size-6">
                                <ArrowRight
                                    className="
                                    m-auto size-3                   
                                    text-muted-foreground
                                    transition-colors
                                    group-hover:text-primary
                                    "
                                />
                            </span>
                            <span className="flex size-6">
                                <ArrowRight className="m-auto size-3" />
                            </span>
                        </div>
                    </div>
                </div>

            </button>
            <Drawer
                anchor="right"
                open={open}
                onClose={() => {

                    dispatch(updateLoja({
                        form: {
                            disabled: true
                        }
                    }));

                    setErrors({
                        dataInicio: false,
                        meta: false,
                        faturamento: false,
                    })

                    setOpen(false);
                }}>
                <Stack spacing={3} sx={{ width: 360, p: 3 }}>
                    <Stack spacing={1}>
                        <Typography variant="h6">
                            Configure a Meta do Mês
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Ajuste a data de início da meta e informe qual será a meta da sua loja.
                        </Typography>
                    </Stack>

                    <Stack component="form" spacing={3}>
                        {/* Data início da meta */}

                        <DatePicker
                            label="Data início da meta"
                            value={dataInicioInput}
                            onChange={(value) => {
                                setErrors((prev) => ({ ...prev, dataInicio: false }))
                                
                                setDataInicioInput(value)

                                dispatch(updateLoja({
                                    form: { disabled: false }
                                }))
                            }}
                            slotProps={{
                                textField: {
                                    error: errors.dataInicio,
                                    helperText: errors.dataInicio ? "Informe a data de início" : "",
                                    variant: "outlined",
                                    fullWidth: true,
                                    InputProps: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <CalendarMonthOutlinedIcon />
                                            </InputAdornment>
                                        ),
                                    },
                                },
                            }}
                        />


                        {/* Meta */}
                        <TextField
                            label="Meta"
                            fullWidth
                            error={errors.meta}
                            helperText={errors.meta ? "Informe o valor da meta" : ""}
                            inputMode="decimal"
                            placeholder="R$ 0,00"
                            value={metaInput}
                            onChange={(e) => {
                                const raw = e.target.value
                                const formatted = formatCurrencyBR(raw)

                                // console.log(formatted)

                                setErrors((prev) => ({ ...prev, meta: false }))
                                setMetaInput(formatted)

                                dispatch(updateLoja({
                                    form: { disabled: false }
                                }))
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <MonetizationOnOutlinedIcon />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "14px",
                                },
                            }}
                        />

                        {/* Faturamento */}
                        <TextField
                            label="Faturamento"
                            fullWidth
                            error={errors.faturamento}
                            helperText={errors.faturamento ? "Informe o vendido até o momento" : ""}
                            inputMode="decimal"
                            placeholder="R$ 0,00"
                            value={faturamentoInput}
                            onChange={(e) => {
                                const raw = e.target.value
                                const formatted = formatCurrencyBR(raw)

                                // console.log(formatted)

                                setErrors((prev) => ({ ...prev, faturamento: false }))
                                setFaturamentoInput(formatted)

                                dispatch(updateLoja({
                                    form: { disabled: false }
                                }))
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <MonetizationOnOutlinedIcon />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "14px",
                                },
                            }}
                        />


                        <Stack spacing={2}>
                            <Button
                                variant="contained"
                                disabled={form.disabled}
                                onClick={handleSubmit}
                                color={hasMetaConfigurada ? "success" : "primary"}
                                sx={{
                                    borderRadius: "14px",
                                }}
                            >
                                {hasMetaConfigurada ? "Alterar" : "Salvar"}
                            </Button>


                            <Button
                                variant="outlined"
                                onClick={() => setOpen(false)}
                                sx={{
                                    borderRadius: "14px",
                                }}
                            >
                                Fechar
                            </Button>
                        </Stack>
                    </Stack>
                </Stack>
            </Drawer>
        </>
    )
}
