"use client";

import { useState } from "react";
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
  FormHelperText,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";

import StoreIcon from '@mui/icons-material/Store';
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import AutorenewIcon from "@mui/icons-material/Autorenew";

import { Button as ButtonSrc } from "@/src/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/src/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { formatCurrencyBR } from "@/src/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { addLoja, filterLojas, resetLoja, unlinkLoja, updateLoja } from "@/src/store/modules/loja/actions";

// ======================
// PAGE
// ======================

export default function LojasView() {
  const dispatch = useDispatch()
  const [selected, setSelected] = useState(null);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const { lojas, loja, behavior, form, components } = useSelector((state: any) => state.loja);

  const setComponent = (component: any, state: any) => {
    dispatch(
      updateLoja({
        components: { ...components, [component]: state },
      })
    );
  };

  const setLoja = (key: any, value: any) => {
    dispatch(
      updateLoja({
        loja: { ...loja, [key]: value },
      })
    );
  };

  const lojassProcessadas = lojas.map((loja: any, index: number) => {
    const vinculoIx = loja?.status;
    const nomeFormat = 'Fabrispuma - Loja: ' + loja?.nome;
    const meta = formatCurrencyBR(loja?.meta);
    const emailFormat = loja?.email || '-'
    return {
      ...loja,
      nomeFormat,
      id: index + 1,
      vinculoIx,
      meta,
      emailFormat,
    };
  });

  const columns = [
    { field: "id", headerName: "ID", width: 10, fixed: true },
    { field: "nomeFormat", headerName: "Nome", width: 250 },
    { field: "emailFormat", headerName: "E-mail", width: 150 },
    { field: "meta", headerName: "Meta", width: 150 },
    { field: "vinculoIx", headerName: "Status", width: 120 },
  ];

  const handleNovaLoja = () => {
    dispatch(resetLoja())
    dispatch(
      updateLoja({
        behavior: "create",
        loja: {
          colaboradorId: '',
          nome: '',
          email: '',
          meta: '',
          status: 'A',
          dataInicio: '',
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

  function handleEditar(loja: any) {
    dispatch(
      updateLoja({
        behavior: "update",
        loja: {
          ...loja,
        }
      })
    );

    setComponent("drawer", true);
  }

  const handleCheckName = () => {
    const nomeLoja = loja?.nome;

    if (!nomeLoja || !nomeLoja.includes("@")) return;

    dispatch(
      filterLojas({
        nomeLoja,
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

    if (!loja?.email) newErrors.email = true;
    if (!loja?.nome) newErrors.nome = true;

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const requiredFields = () => {

    if (!loja?.email) return "E-mail é obrigatório";
    if (!loja?.nome) return "Nome é obrigatório";

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
    dispatch(updateLoja({
      form: {
        ...form,
        saving: true
      }
    }))

    setTimeout(() => {
      dispatch(addLoja());
    }, 1000)

  };

  const handleOpenDialog = (loja: any) => {
    dispatch(
      updateLoja({
        loja: {
          ...loja,
          status: 'E'
        }
      })
    );
    setComponent("confirmDelete", true);
  };

  const handleCloseDialog = () => {
    setComponent("confirmDelete", false)
    setSelected(null);
  };

  const handleExcluir = () => {
    dispatch(unlinkLoja());
  }

  const getStatusBadge = (row: any) => {

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lojas</h1>
        <ButtonSrc className="mr-2" onClick={handleNovaLoja}><Plus className=" h-4 w-4" />Nova loja</ButtonSrc>
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
              {lojassProcessadas.map((row: any) => (
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
            <SheetTitle>{behavior === "update" ? "Editar loja" : "Nova loja"}</SheetTitle>
            <SheetDescription>
              {behavior === "update" ? "Verifique as informações antes de salvar as alterações" : "Informe os dados da loja e clique em salvar"}
            </SheetDescription>
          </SheetHeader>
          <div className="grid flex-1 auto-rows-min gap-6 px-4">
            <Stack spacing={3} maxWidth={400} width="100%">

              <TextField
                label="Número da Loja"
                fullWidth
                error={!!errors.nome}
                value={loja?.nome || ""}
                onBlur={handleCheckName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCheckName()
                  }
                }}
                onChange={(e) => {
                  const onlyNumbers = e.target.value.replace(/\D/g, "")

                  setLoja("nome", onlyNumbers);
                  setErrors((prev) => ({ ...prev, nome: false }));
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <StoreIcon />
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
                label="E-mail"
                type="email"
                error={!!errors.email}
                fullWidth
                value={loja?.email || ""}
                onChange={(e) => {
                  setLoja("email", e.target.value);
                  setErrors((prev) => ({ ...prev, email: false }));
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
                label="Meta"
                fullWidth
                inputMode="decimal"
                placeholder="R$ 0,00"
                value={`R$ ${formatCurrencyBR(loja?.meta)}`}
                onChange={(e) => {
                  setLoja(
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
              {behavior === "update" && (
                <div className="form-group col-4 mb-3">
                  <FormControl
                    fullWidth
                    disabled={loja?.vinculo === "A"}
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "14px",

                        // Outline vermelho quando estiver desativado
                        ...(loja?.status === "E" && {
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
                        ...(loja?.status === "E" && {
                          color: "error.main",
                        }),
                      }}
                    >
                      Status
                    </InputLabel>

                    <Select
                      value={loja?.status || ""}
                      onChange={(e) => setLoja("status", e.target.value)}
                      label="Status"
                      startAdornment={
                        <InputAdornment position="start">
                          <AutorenewIcon />
                        </InputAdornment>
                      }
                      sx={{
                        fontSize: "0.8rem",

                        // Texto vermelho quando desativado
                        ...(loja?.status === "E" && {
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
                      <MenuItem value="A" disabled={loja?.status === "E"}>
                        Ativo
                      </MenuItem>

                      <MenuItem value="I" disabled={loja?.status === "E"}>
                        Inativo
                      </MenuItem>

                      {loja?.status === "E" && (
                        <MenuItem value="E">
                          Desativado
                        </MenuItem>
                      )}
                    </Select>
                    {loja?.vinculo === "A" && (
                      <FormHelperText>
                        Não é possível alterar, pois a loja possui colaboradores vinculados
                      </FormHelperText>
                    )}
                  </FormControl>
                </div>
              )}

              <LoadingButton
                fullWidth
                variant="contained"
                loading={form.saving}
                onClick={handleClickSave}
                sx={{
                  backgroundColor:
                    loja?.status === "E"
                      ? "error.main"
                      : behavior === "update"
                        ? "#2e7d32"
                        : "#1976d2",

                  "&:hover": {
                    backgroundColor:
                      loja?.status === "E"
                        ? "error.dark"
                        : behavior === "update"
                          ? "#1b5e20"
                          : "#115293",
                  },

                  borderRadius: "14px",
                  height: 48,
                }}
              >
                {loja?.status === "E"
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
