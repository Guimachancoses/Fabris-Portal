"use client"

import { useState } from "react"
import { MetasTree } from "./metasTree"
import { MetasDetails } from "./metasDetails"
import { Plus } from "lucide-react"
import { Button as ButtonSrc } from "@/src/components/ui/button";
import { useDispatch, useSelector } from "react-redux"
import { allMetas} from "@/src/store/modules/loja/actions"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/src/components/ui/sheet"
import { Button, FormControl, InputAdornment, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material"
import { LoadingButton } from "@mui/lab"
import { resetMeta, updateMeta } from "@/src/store/modules/metas/actions"
import { formatCurrencyBR } from "@/src/lib/utils"

type SelectedMeta = {
    ano: number | null
    mes: string | null
}

export function MetasView() {
    const dispatch = useDispatch()
    const { userAccount } = useSelector((state: any) => state.colaborador)
    const { behavior, components, meta, form, metas } = useSelector((state: any) => state.metas)
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [selected, setSelected] = useState<SelectedMeta>({
        ano: null,
        mes: null,
    })

    const setComponent = (component: any, state: any) => {
        dispatch(
            updateMeta({
                components: { ...components, [component]: state },
            })
        );
    };

    const setMeta = (key: any, value: any) => {
        dispatch(
            updateMeta({
                meta: { ...meta, [key]: value },
            })
        );
    };

    const handleNovaMeta = () => {
        dispatch(resetMeta())
        dispatch(
            updateMeta({
                behavior: "create",
                meta: {
                    ano: '',
                    mes: '',
                    meta: '',
                    faturamento: '',
                },
                form: {
                    saving: false
                }
            })
        );
        setErrors({
            email: false,
            nome: false,
        });
        setComponent("drawer", true);
    };

    console.log("meta: ", meta)

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Histórico de Metas</h1>
                <ButtonSrc
                    onClick={handleNovaMeta}
                >
                    <Plus className="h-4 w-4" />
                    Registrar meta
                </ButtonSrc>
            </div>
            <div className="grid grid-cols-12 gap-6">

                {/* Card esquerda */}
                <div className="col-span-10">
                    <MetasDetails
                        selected={selected}
                    />
                </div>

                {/* Card direita */}
                <div className="col-span-2">
                    <MetasTree
                        onSelect={(ano, mes) => {
                            setSelected({ ano, mes })
                            if (ano && mes) {
                                dispatch(allMetas({
                                    lojaId: userAccount.lojaId,
                                    ano: ano.toString(),
                                    mes: mes,
                                }))
                            }
                        }}
                    />
                </div>

            </div>
            {/* DRAWER */}
            <Sheet
                open={components.drawer}
                onOpenChange={(open) => setComponent("drawer", open)}
            >
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>{behavior === "update" ? "Editar meta" : "Nova meta"}</SheetTitle>
                        <SheetDescription>
                            {behavior === "update" ? "Verifique as informações antes de salvar as alterações" : "Informe as metas da loja e dos colaboradores e também o período e clique em salvar"}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="grid flex-1 auto-rows-min gap-6 px-4">
                        <Stack spacing={2} maxWidth={400} width="100%">

                            {/* PERÍODO */}
                            <TextField
                                label="Ano"
                                value={meta?.ano || ""}
                                onChange={(e) => setMeta("ano", e.target.value)}
                                error={!!errors.ano}
                                fullWidth
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "14px",
                                    },
                                }}
                            />

                            <FormControl
                                fullWidth
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "14px",
                                    },
                                }}
                            >
                                <InputLabel>Mês</InputLabel>
                                <Select
                                    value={meta?.mes || ""}
                                    label="Mês"
                                    onChange={(e) => setMeta("mes", e.target.value)}
                                    MenuProps={{
                                        disablePortal: true,
                                        PaperProps: {
                                            sx: {
                                                fontSize: "0.8rem",
                                                zIndex: 2000,
                                            },
                                        }
                                    }}
                                >
                                    <MenuItem value="Janeiro">Janeiro</MenuItem>
                                    <MenuItem value="Fevereiro">Fevereiro</MenuItem>
                                    <MenuItem value="Março">Março</MenuItem>
                                    <MenuItem value="Abril">Abril</MenuItem>
                                    <MenuItem value="Maio">Maio</MenuItem>
                                    <MenuItem value="Junho">Junho</MenuItem>
                                    <MenuItem value="Julho">Julho</MenuItem>
                                    <MenuItem value="Agosto">Agosto</MenuItem>
                                    <MenuItem value="Setembro">Setembro</MenuItem>
                                    <MenuItem value="Outubro">Outubro</MenuItem>
                                    <MenuItem value="Novembro">Novembro</MenuItem>
                                    <MenuItem value="Dezembro">Dezembro</MenuItem>
                                </Select>
                            </FormControl>

                            {/* META DA LOJA */}
                            <TextField
                                label="Meta da Loja"
                                value={formatCurrencyBR(meta?.meta) || ""}
                                onChange={(e) => setMeta("meta", formatCurrencyBR(e.target.value))}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                                }}
                                fullWidth
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "14px",
                                    },
                                }}
                            />

                            <TextField
                                label="Faturamento da Loja"
                                value={meta?.faturamento || ""}
                                onChange={(e) => setMeta("faturamento", e.target.value)}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                                }}
                                fullWidth
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "14px",
                                    },
                                }}
                            />

                            <LoadingButton
                                fullWidth
                                variant="contained"
                                loading={form.saving}
                                //onClick={handleClickSave}
                                sx={{
                                    borderRadius: "14px",
                                }}
                            >
                                {behavior === "update"
                                    ? "Alterar"
                                    : "Salvar"}
                            </LoadingButton>

                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => setComponent("drawer", false)}
                                sx={{
                                    borderRadius: "14px",
                                }}
                            >
                                Fechar
                            </Button>

                        </Stack>
                    </div>

                </SheetContent>
            </Sheet>
        </div>
    )
}
