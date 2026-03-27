"use client";

import { useEffect, useState } from "react";
import {
  TextField,
  Button,
  InputAdornment,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  Box,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";

import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';

import { Button as ButtonSrc } from "@/src/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/src/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { formatCurrencyBR, formatPhoneBR, onlyNumbers } from "@/src/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { updateColaborador, filterColaboradores, addColaborador, unlinkColaborador, resetColaborador } from "@/src/store/modules/colaborador/actions";
import { toast } from "sonner";
import { useClerk } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import { map } from "lodash";

// ======================
// PAGE
// ======================

export default function ColaboradoresView() {
  const dispatch = useDispatch()
  const [selected, setSelected] = useState(null);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const { user } = useClerk()

  const userEmail = user?.primaryEmailAddress?.emailAddress;

  const { colaborador, colaboradores, behavior, form, components, userAccount } =
    useSelector((state: any) => state.colaborador);

  const { lojas } = useSelector((state: any) => state.loja);

  const setComponent = (component: any, state: any) => {
    dispatch(
      updateColaborador({
        components: { ...components, [component]: state },
      })
    );
  };

  const setColaborador = (key: any, value: any) => {
    dispatch(
      updateColaborador({
        colaborador: { ...colaborador, [key]: value },
      })
    );
  };

  const getVinculoAtivo = (colaborador: any) =>
    colaborador?.empresas?.find((e: any) => e.status === "A");

  const colaboradoresProcessados = colaboradores.filter((colaborador: any) => {
    // Esconde o colaborador logado
    if (
      userEmail &&
      colaborador.email?.toLowerCase() === userEmail.toLowerCase()
    ) {
      return false;
    }

    // Remove administradores
    if (colaborador.funcao === "Admin") {
      return false;
    }

    return true;
  }).map((colaborador: any, index: number) => {
    const vinculoAtivo = getVinculoAtivo(colaborador);
    const telefone = colaborador?.telefone;
    const vinculoIx = vinculoAtivo?.status ?? "I";
    const nomeFormat = colaborador?.nome + " " + colaborador?.sobrenome;
    const meta = formatCurrencyBR(colaborador?.meta);
    const nomeLoja = vinculoAtivo?.loja?.nome
      ? `Fabrispuma - Loja: ${vinculoAtivo.loja.nome}`
      : "-";

    let telefoneFormatado = "Telefone inválido";
    if (telefone && telefone?.area && telefone?.numero) {
      const numero = String(telefone?.numero);
      telefoneFormatado = `(${numero.substring(0, 2)}) ${numero.substring(
        2,
        7
      )}-${numero.substring(7)}`;
    }

    return {
      ...colaborador,
      nomeFormat,
      telefoneFormatado,
      id: index + 1,
      vinculoIx,
      meta,
      nomeLoja,
    };
  });

  const columns = [
    { field: "id", headerName: "ID", width: 10, fixed: true },
    { field: "nomeFormat", headerName: "Nome", width: 250 },
    { field: "email", headerName: "E-mail", width: 150 },
    { field: "telefoneFormatado", headerName: "Telefone", width: 150 },
    { field: "funcao", headerName: "Função", width: 150 },
    { field: "meta", headerName: "Meta", width: 150 },
    { field: "vinculoIx", headerName: "Status", width: 120 },

    ...(userAccount?.funcao === "Admin"
      ? [{ field: "nomeLoja", headerName: "Loja", width: 200 }]
      : []),
  ];

  const FUNCAO_LABEL: Record<string, string> = {
    Admin: "Administrador",
    G: "Gerente",
    V: "Vendedor",
    Aux: "Aux. Administrativo",
  };

  const handleNovoColaborador = () => {
    dispatch(resetColaborador())
    dispatch(
      updateColaborador({
        behavior: "create",
        colaborador: {
          nome: "",
          sobrenome: "",
          email: "",
          funcao: "",
          meta: "",
          empresas: [],
          vinculo: {
            vinculoId: '',
            status: 'A',
            lojaId: '',
          },
          sexo: undefined,
          telefone: {
            area: "55",
            numero: "",
          },
        },
        form: {
          saving: false
        }
      })
    );
    setErrors({
      email: false,
      nome: false,
      sobrenome: false,
      telefone: false,
      funcao: false,
    });
    setComponent("drawer", true);
  };

  function handleEditar(colaborador: any) {
    const vinculo = colaborador.empresas?.[0];
    console.log(vinculo)
    dispatch(
      updateColaborador({
        behavior: "update",
        colaborador: {
          ...colaborador,
          vinculo: {
            vinculoId: vinculo?.vinculoId,
            status: vinculo?.status,
            lojaId: vinculo?.loja?._id,
          },
        },
      })
    );

    setComponent("drawer", true);
  }

  const handleCheckEmail = () => {
    const email = colaborador?.email;

    if (!email || !email.includes("@")) return;

    dispatch(
      filterColaboradores({
        email,
        status: "A",
      })
    );
    setErrors({
      email: false,
      nome: false,
      sobrenome: false,
      telefone: false,
      funcao: false,
    });
  };

  const validateFields = () => {
    const newErrors: Record<string, boolean> = {};

    if (!colaborador?.email) newErrors.email = true;
    if (!colaborador?.nome) newErrors.nome = true;
    if (!colaborador?.sobrenome) newErrors.sobrenome = true;
    if (!colaborador?.telefone?.numero) newErrors.telefone = true;
    if (!colaborador?.funcao) newErrors.funcao = true;

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const requiredFields = () => {

    if (!colaborador?.email) return "E-mail é obrigatório";
    if (!colaborador?.nome) return "Nome é obrigatório";
    if (!colaborador?.sobrenome) return "Sobrenome é obrigatório";
    if (!colaborador?.telefone?.numero) return "Telefone é obrigatório";
    if (!colaborador?.funcao) return "Função é obrigatória";

    return null;
  };

  const handleClickSave = () => {
    const errorMessage = requiredFields();
    const isValid = validateFields();

    if (errorMessage && !isValid) {
      toast.error("Preencha os campos obrigatórios", {
        description: errorMessage,
      });
      return;
    }
    dispatch(updateColaborador({
      form: {
        ...form,
        saving: true
      }
    }))

    setTimeout(() => {
      dispatch(addColaborador());
    }, 1000)

  };

  const handleOpenDialog = (colaborador: any) => {
    const vinculoAtivo = getVinculoAtivo(colaborador);
    dispatch(
      updateColaborador({
        colaborador,
      })
    );
    setSelected(vinculoAtivo?.vinculoId ?? null);
    setComponent("confirmDelete", true);
  };

  const handleCloseDialog = () => {
    setComponent("confirmDelete", false)
    setSelected(null);
  };

  const handleExcluir = () => {
    dispatch(unlinkColaborador(selected as any));
  }

  const getStatusBadge = (row: any) => {
    if (row.recipientId) {
      return {
        label: "Pendente",
        color: "#f9a825", // amarelo
      };
    }

    if (row.vinculoIx === "A") {
      return {
        label: "Ativo",
        color: "#2e7d32", // verde
      };
    }

    return {
      label: "Inativo",
      color: "#d32f2f", // vermelho
    };
  };

  const lojaSelecionadaId = colaborador?.vinculo?.lojaId || "";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Colaboradores</h1>
        <ButtonSrc onClick={handleNovoColaborador}><Plus className="h-4 w-4" />Novo colaborador</ButtonSrc>
      </div>

      <div className="rounded-xl border shadow-sm overflow-hidden hidden md:block">
        <div className="max-h-[420px] overflow-auto">
          <Table>
            <TableHeader className="bg-card sticky top-0 z-10">
              <TableRow>
                {columns.map((col) => (
                  <TableHead
                    key={col.field}
                    style={{ width: col.width }}
                    className={col.fixed ? "sticky left-0 bg-card z-20" : ""}
                  >
                    {col.headerName}
                  </TableHead>
                ))}
                <TableHead className="text-right px-20">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {colaboradoresProcessados.map((row: any) => (
                <TableRow key={row._id ?? row.id}>
                  {columns.map((col) => (
                    <TableCell key={col.field}>
                      {col.field === "vinculoIx" ? (
                        <Box paddingLeft={3}>
                          {(() => {
                            const status = getStatusBadge(row);

                            return (
                              <Badge
                                badgeContent={status.label}
                                sx={{
                                  "& .MuiBadge-badge": {
                                    backgroundColor: status.color,
                                    color: "#fff",
                                    fontSize: "0.7rem",
                                    padding: "0 8px",
                                    height: "22px",
                                    borderRadius: "12px",
                                  },
                                }}
                              />
                            );
                          })()}
                        </Box>
                      ) : col.field === "funcao" ? (
                        FUNCAO_LABEL[row.funcao] ?? "-"
                      ) : col.field === "meta" ? (
                        row.meta ? `R$ ${row.meta}` : "-"
                      ) : (
                        row[col.field] ?? "-"
                      )}

                    </TableCell>
                  ))}
                  <TableCell className="text-right space-x-2">
                    <ButtonSrc
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditar(row)}
                    >
                      Editar
                    </ButtonSrc>

                    <ButtonSrc
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        handleOpenDialog(row)
                      }}
                    >
                      Excluir
                    </ButtonSrc>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* DRAWER */}
      <Sheet
        open={components.drawer}
        onOpenChange={(open) => setComponent("drawer", open)}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{behavior === "update" ? "Editar colaborador" : "Novo colaborador"}</SheetTitle>
            <SheetDescription>
              {behavior === "update" ? "Verifique as informações antes de salvar as alterações" : "Informe os dados do novo colaborador e clique em salvar"}
            </SheetDescription>
          </SheetHeader>
          <div className="grid flex-1 auto-rows-min gap-6 px-4">
            <Stack spacing={3} maxWidth={400} width="100%">

              <TextField
                label="E-mail"
                type="email"
                error={!!errors.email}
                fullWidth
                disabled={behavior === "update"}
                value={colaborador?.email || ""}
                onChange={(e) => {
                  setColaborador("email", e.target.value);
                  setErrors((prev) => ({ ...prev, email: false }));
                }}
                onBlur={handleCheckEmail}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCheckEmail()
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutlineIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                  },
                }}
              />

              <TextField
                label="Nome"
                fullWidth
                error={!!errors.nome}
                value={colaborador?.nome || ""}
                onChange={(e) => {
                  setColaborador("nome", e.target.value);
                  setErrors((prev) => ({ ...prev, nome: false }));
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                  },
                }}
              />

              <TextField
                label="Sobrenome"
                fullWidth
                error={!!errors.sobrenome}
                value={colaborador?.sobrenome || ""}
                onChange={(e) => {
                  setColaborador("sobrenome", e.target.value);
                  setErrors((prev) => ({ ...prev, sobrenome: false }));
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                  },
                }}
              />

              <TextField
                label="Telefone"
                fullWidth
                error={!!errors.telefone}
                placeholder="(19) 99999-0909"
                value={formatPhoneBR(colaborador?.telefone?.numero || "")}
                onChange={(e) => {
                  const digits = onlyNumbers(e.target.value);

                  setErrors((prev) => ({ ...prev, telefone: false }));
                  setColaborador("telefone", {
                    ...colaborador.telefone,
                    numero: digits,
                  });
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneAndroidIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                  },
                }}
              />

              <TextField
                label="Meta"
                fullWidth
                inputMode="decimal"
                placeholder="R$ 0,00"
                value={`R$ ${formatCurrencyBR(colaborador?.meta)}`}
                onChange={(e) => {
                  setColaborador(
                    "meta",
                    formatCurrencyBR(e.target.value)
                  );
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
              {userAccount.funcao === "Admin" && (
                <div className="form-group col-8 mb-3">
                  <FormControl
                    fullWidth
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "14px",
                      },
                    }}>
                    <InputLabel>Empresa</InputLabel>

                    <Select
                      value={lojaSelecionadaId}
                      label="Empresa"
                      onChange={(e) => {
                        setColaborador("vinculo", {
                          ...colaborador.vinculo,
                          lojaId: e.target.value,
                        });
                      }}
                      startAdornment={
                        <InputAdornment position="start">
                          <AutorenewIcon />
                        </InputAdornment>
                      }
                      MenuProps={{
                        disablePortal: true,
                        PaperProps: {
                          sx: {
                            zIndex: 2000,
                            position: "absolute",
                          },
                        },
                      }}
                      sx={{ fontSize: "0.8rem" }}
                    >
                      {lojas.map((loja: any) => (
                        <MenuItem key={loja._id} value={loja._id}>
                          {loja.nome}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                </div>
              )}
              {behavior === "update" && (
                <div className="form-group col-4 mb-3">
                  <FormControl
                    fullWidth
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "14px",

                        // Outline vermelho quando estiver desativado
                        ...(getVinculoAtivo(colaborador)?.status === "E" && {
                          "& fieldset": {
                            borderColor: "error.main",
                          },
                          "&:hover fieldset": {
                            borderColor: "error.main",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "error.main",
                          },
                        }),
                      },
                    }}
                  >
                    <InputLabel
                      sx={{
                        ...(getVinculoAtivo(colaborador)?.status === "E" && {
                          color: "error.main",
                        }),
                      }}
                    >
                      Status
                    </InputLabel>

                    <Select
                      value={colaborador?.vinculo?.status || ""}
                      onChange={(e) => {
                        setColaborador("vinculo", {
                          ...colaborador.vinculo,
                          status: e.target.value,
                        });
                      }}
                      label="Status"
                      startAdornment={
                        <InputAdornment position="start">
                          <AutorenewIcon />
                        </InputAdornment>
                      }
                      sx={{
                        fontSize: "0.8rem",

                        // Texto vermelho quando desativado
                        ...(getVinculoAtivo(colaborador)?.status === "E" && {
                          color: "error.main",
                        }),
                      }}
                      MenuProps={{
                        disablePortal: true,
                        PaperProps: {
                          sx: {
                            fontSize: "0.8rem",
                            zIndex: 2000,
                          },
                        },
                      }}
                    >
                      <MenuItem value="A" disabled={getVinculoAtivo(colaborador)?.status === "E"}>
                        Ativo
                      </MenuItem>

                      <MenuItem value="I" disabled={getVinculoAtivo(colaborador)?.status === "E"}>
                        Inativo
                      </MenuItem>

                      {getVinculoAtivo(colaborador)?.status === "E" && (
                        <MenuItem value="E">
                          Desativado
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </div>
              )}

              <div className="form-group col-4 mb-3">
                <FormControl
                  fullWidth
                  error={!!errors.funcao}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "14px",
                    },
                  }}>
                  <InputLabel>Função</InputLabel>
                  <Select
                    value={colaborador?.funcao || ""}
                    onChange={(e) => {
                      setColaborador("funcao", e.target.value);
                      setErrors((prev) => ({ ...prev, funcao: false }));
                    }}
                    label="Função"
                    startAdornment={
                      <InputAdornment position="start">
                        <WorkOutlineIcon />
                      </InputAdornment>
                    }
                    sx={{ fontSize: "0.8rem" }} // Aplica no valor selecionado
                    MenuProps={{
                      disablePortal: true,
                      PaperProps: {
                        sx: {
                          fontSize: "0.8rem", // Aplica no dropdown,
                          zIndex: 2000,
                        },
                      },
                    }}
                  >
                    {userAccount?.funcao === "Admin" && (<MenuItem value="Admin">Admintistrador</MenuItem>)}
                    <MenuItem value="G">Gerente</MenuItem>
                    <MenuItem value="V">Vendedor</MenuItem>
                    <MenuItem value="Aux">Aux. Administrativo</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <LoadingButton
                fullWidth
                variant="contained"
                loading={form.saving}
                onClick={handleClickSave}
                sx={{
                  backgroundColor:
                    getVinculoAtivo(colaborador)?.status === "E"
                      ? "error.main"
                      : behavior === "update"
                        ? "#2e7d32"
                        : "#1976d2",

                  "&:hover": {
                    backgroundColor:
                      getVinculoAtivo(colaborador)?.status === "E"
                        ? "error.dark"
                        : behavior === "update"
                          ? "#1b5e20"
                          : "#115293",
                  },

                  borderRadius: "14px",
                  height: 48,
                }}
              >
                {getVinculoAtivo(colaborador)?.status === "E"
                  ? "Reativar"
                  : behavior === "update"
                    ? "Alterar"
                    : "Salvar"}
              </LoadingButton>

              <Button
                fullWidth
                variant="outlined"
                onClick={() => setComponent("drawer", false)}
                sx={{
                  borderRadius: "14px",
                  height: 48,
                }}
              >
                Fechar
              </Button>

            </Stack>
          </div>

        </SheetContent>
      </Sheet>

      {/* CONFIRM DELETE */}
      <Dialog
        open={components.confirmDelete}
        onOpenChange={(open) => setComponent("confirmDelete", open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir este colaborador?
          </p>

          <div className="flex justify-end gap-2 mt-4">
            <ButtonSrc variant="outline"
              onClick={handleCloseDialog}
            >
              Cancelar
            </ButtonSrc>
            <ButtonSrc variant="destructive"
              onClick={handleExcluir}
            >
              Excluir
            </ButtonSrc>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
