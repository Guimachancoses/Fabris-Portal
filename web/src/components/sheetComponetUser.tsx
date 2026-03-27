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
import { ArrowRight, ChartNoAxesCombinedIcon, ChevronRight } from "lucide-react"
import { cn, formatCurrencyBR, parseCurrencyBR } from "@/src/lib/utils"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "sonner"
import { AnimatedGradientText } from "./ui/animated-gradient-text"
import { allUpdateColaborador, updateColaborador } from "../store/modules/colaborador/actions"

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault("America/Sao_Paulo")

export function SheetComponentUser() {
    const dispatch = useDispatch()
    const [open, setOpen] = useState(false)
    const [metaInput, setMetaInput] = useState("")
    const [faturamentoInput, setFaturamentoInput] = useState("")
    const { userAccount, colaborador, form } = useSelector((state: any) => state.colaborador)
    const hasMetaConfigurada = Boolean(userAccount?.dataInicio) || Boolean(userAccount?.meta)
    const [errors, setErrors] = useState({
        dataInicio: false,
        meta: false,
        faturamento: false,
    })

    useEffect(() => {
        if (open && userAccount?.meta) {
            setMetaInput(formatCurrencyBR(userAccount.meta))
        }
        if (open && userAccount?.faturamento) {
            setFaturamentoInput(formatCurrencyBR(userAccount.faturamento))
        }
    }, [open, userAccount?.meta, userAccount?.faturamento])

    const validateFields = () => {
        const newErrors: any = {}

        if (!metaInput || metaInput === "0,00") newErrors.meta = true
        if (!faturamentoInput || faturamentoInput === "0,00") newErrors.faturamento = true

        setErrors(newErrors)

        return Object.keys(newErrors).length === 0
    }

    const requiredFields = () => {
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
            updateColaborador({
                colaborador: {
                    ...colaborador,
                    meta: parseCurrencyBR(metaInput),
                    faturamento: parseCurrencyBR(faturamentoInput),
                },
            })
        )
        setTimeout(() => {
            dispatch(allUpdateColaborador());
        }, 1000)

        setOpen(false)
    }

    return (
        <>
            <button
                data-tour="ajustar-meta-user"
                onClick={() => setOpen(true)}
                className="
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
                    hover:bg-primary/13
                    hover:[item]-primary/10
                    dark:bg-background
                    dark:hover:bg-primary/20
                    "
            >
                <span
                    className={cn(
                        "pointer-events-none animate-gradient absolute inset-0 block h-full w-full rounded-[inherit] bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-[length:300%_100%] p-[1px]"
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

                <ChartNoAxesCombinedIcon
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
                <span className="text-foreground text-sm"><AnimatedGradientText>Ajustar sua Meta</AnimatedGradientText></span>
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

                <div className="bg-primary/90  text-white group-hover:bg-white dark:group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500 mx-1">
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
            </button>
            <Drawer
                anchor="right"
                open={open}
                onClose={() => {

                    dispatch(updateColaborador({
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
                            Configure sua Meta do Mês
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Ajuste a sua meta e seu faturamento, também épossivel informar sua venda diária.
                        </Typography>
                    </Stack>

                    <Stack component="form" spacing={3}>

                        {/* Meta */}
                        <TextField
                            label="Sua Meta"
                            fullWidth
                            error={errors.meta}
                            helperText={errors.meta ? "Informe o valor da sua meta" : ""}
                            inputMode="decimal"
                            placeholder="R$ 0,00"
                            value={metaInput}
                            onChange={(e) => {
                                const raw = e.target.value
                                const formatted = formatCurrencyBR(raw)

                                console.log(formatted)

                                setErrors((prev) => ({ ...prev, meta: false }))
                                setMetaInput(formatted)

                                dispatch(updateColaborador({
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
                            helperText={errors.faturamento ? "Informe o seu valor vendido até o momento" : ""}
                            inputMode="decimal"
                            placeholder="R$ 0,00"
                            value={faturamentoInput}
                            onChange={(e) => {
                                const raw = e.target.value
                                const formatted = formatCurrencyBR(raw)

                                console.log(formatted)

                                setErrors((prev) => ({ ...prev, faturamento: false }))
                                setFaturamentoInput(formatted)

                                dispatch(updateColaborador({
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
