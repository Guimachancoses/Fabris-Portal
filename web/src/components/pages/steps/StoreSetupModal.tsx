"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import clsx from "clsx";
import { LogoIcon } from "../../logo";
import TextField from "@mui/material/TextField";
import { useDispatch, useSelector } from "react-redux";
import { formatCurrencyBR, parseCurrencyBR } from "@/src/lib/utils";

import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { DialogTitle } from "@mui/material";
import { addLoja, updateLoja } from "@/src/store/modules/loja/actions";
import { toast } from "sonner";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { allUpdateColaborador, updateColaborador } from "@/src/store/modules/colaborador/actions";

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault("America/Sao_Paulo")

const steps = [
    { id: "store", label: "Informações da loja" },
    { id: "user", label: "Suas metas" },
    { id: "finish", label: "Finalizar" },
];

export function StoreSetupModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const dispatch = useDispatch()
    const [stepIndex, setStepIndex] = useState(0);
    const [nomeInput, setNomeInput] = useState("")
    const [metaInput, setMetaInput] = useState("")
    const [faturamentoInput, setFaturamentoInput] = useState("")
    const [metaUserInput, setMetaUserInput] = useState("")
    const [faturamentoUserInput, setFaturamentoUserInput] = useState("")
    const [dataInicioInput, setDataInicioInput] = useState<dayjs.Dayjs | null>(null)
    const { loja, lojaAccount } = useSelector((state: any) => state.loja)
    const { userAccount, components } = useSelector((state: any) => state.colaborador)
    const [errors, setErrors] = useState({
        nome: false,
        dataInicio: false,
        meta: false,
        faturamento: false,
        metaUser: false,
        faturamentoUser: false
    })

    const hasStoreData =
        !!lojaAccount?.nome ||
        !!lojaAccount?.dataInicio ||
        !!lojaAccount?.meta ||
        !!lojaAccount?.faturamento

    const hideUserStep =
        !!userAccount?.meta ||
        !!userAccount?.faturamento

    const shouldSkipStoreStep =
        userAccount?.funcao === "V" || userAccount?.funcao === "Aux"

    const hideStoreStep = shouldSkipStoreStep || hasStoreData

    const concludedSteps = hideUserStep && hasStoreData

    const hiddenSteps = new Set<string>();

    if (hideStoreStep) hiddenSteps.add("store");
    if (hideUserStep) hiddenSteps.add("user");

    const visibleSteps = steps.filter(step => !hiddenSteps.has(step.id));


    const step = visibleSteps[stepIndex] ?? visibleSteps[0]

    useEffect(() => {
        if (!open) return

        setStepIndex(0)
    }, [open, hideStoreStep])

    useEffect(() => {
        if (open && lojaAccount?.nome) {
            setNomeInput(lojaAccount.nome)
        }
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

        if (open && userAccount?.meta) {
            setMetaUserInput(formatCurrencyBR(userAccount.meta))
        }

        if (open && userAccount?.faturamento) {
            setFaturamentoUserInput(formatCurrencyBR(userAccount.faturamento))
        }
    }, [open, lojaAccount?.nome, lojaAccount?.meta, lojaAccount?.dataInicio, lojaAccount?.faturamento, userAccount?.meta, userAccount?.faturamento])

    useEffect(() => {
        if (concludedSteps) {
            dispatch(updateColaborador({
                components: {
                    firstSteps: false
                }
            }))
        }
    }, [hideUserStep])

    const next = () => {
        setStepIndex((s) => {
            if (s < visibleSteps.length - 1) return s + 1
            onClose()
            return s
        })
    }

    const back = () => {
        setStepIndex((s) => Math.max(s - 1, 0))
    }

    const validateFields = () => {
        const newErrors: any = {}

        if (step.id === "store") {
            if (!nomeInput) newErrors.nome = true
            if (!dataInicioInput) newErrors.dataInicio = true
            if (!metaInput || metaInput === "0,00") newErrors.meta = true
            if (!faturamentoInput || faturamentoInput === "0,00")
                newErrors.faturamento = true
        }

        if (step.id === "user") {
            if (!metaUserInput || metaUserInput === "0,00")
                newErrors.metaUser = true
            if (!faturamentoUserInput || faturamentoUserInput === "0,00")
                newErrors.faturamentoUser = true
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }


    const requiredFields = () => {
        if (step.id === "store") {
            if (!nomeInput) return "Nome da loja é obrigatório"
            if (!dataInicioInput) return "Data de início é obrigatória"
            if (!metaInput || metaInput === "0,00") return "Meta é obrigatória"
            if (!faturamentoInput || faturamentoInput === "0,00")
                return "Faturamento é obrigatório"
        }

        if (step.id === "user") {
            if (!metaUserInput || metaUserInput === "0,00")
                return "Sua meta é obrigatória"
            if (!faturamentoUserInput || faturamentoUserInput === "0,00")
                return "Seu faturamento é obrigatório"
        }

        return null
    }


    const handleSubmitStore = () => {
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
                behavior: "create",
                loja: {
                    ...loja,
                    colaboradorId: userAccount.colaboradorId,
                    nome: nomeInput,
                    dataInicio: dataInicioInput?.toISOString(),
                    meta: parseCurrencyBR(metaInput),
                    faturamento: parseCurrencyBR(faturamentoInput),
                },
            })
        )

        dispatch(addLoja())

        if (!errorMessage && isValid) {
            next()
        }
    }

    const handleSubmitUser = () => {
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
                behavior: "update",
                components: {
                    ...components,
                    firstSteps: false,
                },
                colaborador: {
                    ...userAccount,
                    meta: metaUserInput,
                    faturamento: parseCurrencyBR(faturamentoUserInput),
                },
            })
        )

        setTimeout(() => {
            dispatch(allUpdateColaborador());
        }, 1000)

        if (!errorMessage && isValid) {
            next()
        }

    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
           <DialogContent className="max-w-5xl p-0 overflow-visible">
                <VisuallyHidden>
                    <DialogTitle>Onboarding 2</DialogTitle>
                </VisuallyHidden>
                <div className="grid grid-cols-[260px_1fr] h-[520px]">

                    {/* SIDEBAR */}
                    <aside className="bg-muted p-6 flex flex-col gap-4">
                        <h2 className="font-semibold text-lg">
                            Configuração inicial
                        </h2>

                        {visibleSteps.map((s, i) => (
                            <div
                                key={s.id}
                                className={clsx(
                                    "px-3 py-2 rounded-md text-sm",
                                    i === stepIndex
                                        ? "bg-primary text-white"
                                        : "text-muted-foreground"
                                )}
                            >
                                {s.label}
                            </div>
                        ))}

                        <div className="mt-auto text-xs text-muted-foreground flex items-center gap-2">
                            <LogoIcon />
                            Fabris Meta
                        </div>
                    </aside>

                    {/* CONTENT */}
                    <main className="p-8 flex flex-col gap-6">

                        {/* STEP 1 – LOJA */}
                        {step.id === "store" && (
                            <>
                                <h3 className="text-xl font-semibold">
                                    Informações da loja
                                </h3>

                                <div className="grid grid-cols gap-4">
                                    <TextField
                                        label="Número da Loja"
                                        fullWidth
                                        value={nomeInput}
                                        disabled={hasStoreData}
                                        onChange={(e) => {
                                            const onlyNumbers = e.target.value.replace(/\D/g, "")

                                            setErrors((prev) => ({ ...prev, nome: false }))
                                            setNomeInput(onlyNumbers) // ← sempre string
                                        }}
                                        error={errors.nome}
                                        helperText={errors.nome ? "Informe o número da loja" : ""}
                                        inputProps={{
                                            inputMode: "numeric", // teclado numérico no mobile
                                            pattern: "[0-9]*",     // reforço para browsers
                                        }}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "14px",
                                            },
                                        }}
                                    />


                                    <TextField
                                        label="Meta da Loja (R$)"
                                        value={metaInput}
                                        disabled={hasStoreData}
                                        onChange={(e) => {
                                            setErrors((prev) => ({ ...prev, meta: false }))
                                            setMetaInput(formatCurrencyBR(e.target.value))
                                        }}
                                        error={errors.meta}
                                        helperText={errors.meta ? "Informe a meta da loja" : ""}
                                        fullWidth
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "14px",
                                            },
                                        }}
                                    />

                                    <DatePicker
                                        label="Data início da meta"
                                        value={dataInicioInput}
                                        disabled={hasStoreData}
                                        onChange={(value: any) => {
                                            setErrors((prev) => ({ ...prev, dataInicio: false }))
                                            setDataInicioInput(value)

                                            dispatch(
                                                updateLoja({
                                                    form: { disabled: false },
                                                })
                                            )
                                        }}
                                        slotProps={{
                                            textField: {
                                                error: errors.dataInicio,
                                                helperText: errors.dataInicio ? "Informe a data de início" : "",
                                                variant: "outlined",
                                                fullWidth: true,
                                            },
                                            popper: {
                                                disablePortal: true, // 🔥 ESSENCIAL
                                                sx: {
                                                    zIndex: 1500,
                                                },
                                            },
                                        }}
                                    />

                                    <TextField
                                        label="Valor vendido até agora (R$)"
                                        value={faturamentoInput}
                                        disabled={hasStoreData}
                                        onChange={(e) => {
                                            setErrors((prev) => ({ ...prev, faturamento: false }))
                                            setFaturamentoInput(formatCurrencyBR(e.target.value))
                                        }}
                                        error={errors.faturamento}
                                        helperText={errors.faturamento ? "Informe o faturamento da loja" : ""}
                                        fullWidth
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "14px",
                                            },
                                        }}
                                    />
                                </div>
                            </>
                        )}

                        {/* STEP 2 – USUÁRIO */}
                        {step.id === "user" && (
                            <>
                                <h3 className="text-xl font-semibold">
                                    Suas metas
                                </h3>

                                <div className="grid grid-cols gap-4">
                                    <TextField
                                        label="Sua meta (R$)"
                                        fullWidth
                                        value={metaUserInput}
                                        disabled={hideUserStep}
                                        onChange={(e) => {
                                            setErrors((prev) => ({ ...prev, metaUser: false }))
                                            setMetaUserInput(formatCurrencyBR(e.target.value))
                                        }}
                                        helperText={errors.metaUser ? "Informe a sua menta" : ""}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "14px",
                                            },
                                        }}
                                    />

                                    <TextField
                                        label="Valor vendido até agora (R$)"
                                        value={faturamentoUserInput}
                                        disabled={hideUserStep}
                                        onChange={(e) => {
                                            setErrors((prev) => ({ ...prev, faturamentoUser: false }))
                                            setFaturamentoUserInput(formatCurrencyBR(e.target.value))
                                        }}
                                        helperText={errors.faturamentoUser ? "Informe o seu faturamento atual" : ""}
                                        fullWidth
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "14px",
                                            },
                                        }}
                                    />
                                </div>
                            </>
                        )}

                        {/* STEP 3 – FINAL */}
                        {step.id === "finish" && (
                            <>
                                <h3 className="text-xl font-semibold">
                                    Tudo certo 🎯
                                </h3>
                                <p className="text-muted-foreground">
                                    As informações foram preenchidas. Você pode alterar isso depois nas configurações.
                                </p>
                            </>
                        )}

                        {/* ACTIONS */}
                        <div className="mt-auto flex justify-end">
                            {/* <Button
                                variant="outline"
                                disabled={stepIndex === 0}
                                onClick={back}
                            >
                                Voltar
                            </Button> */}

                            <Button
                                onClick={() => {
                                    if (step.id === "store") {
                                        handleSubmitStore()
                                    } else if (step.id === "user") {
                                        handleSubmitUser()
                                    } else {
                                        dispatch(updateColaborador({
                                            components: {
                                                firstSteps: false
                                            }
                                        }))
                                        next()
                                    }
                                }}
                            >
                                {step.id === "store"
                                    ? "Salvar"
                                    : step.id === "user"
                                        ? "Salvar"
                                        : "Concluir"}
                            </Button>

                        </div>
                    </main>
                </div>
            </DialogContent>
        </Dialog>
    );
}
