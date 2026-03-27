import types from "./types"

/* =======================
 * Action Creators
 * ======================= */

export const allColaboradores = () => ({
  type: types.ALL_COLABORADORES,
});

export const updateColaborador = (payload: any) => ({
  type: types.UPDATE_COLABORADOR,
  payload,
});

export const allUpdateColaborador = () => ({
  type: types.UPDATE_ALL_COLABORADOR,
});

export const filterColaboradores = (filters: any) => ({
  type: types.FILTER_COLABORADORES,
  filters
});

export const filterAllColaboradores = (filters: any) => ({
  type: types.FILTER_ALL_COLABORADORES,
  filters
});

export const addColaborador = () => ({
  type: types.ADD_COLABORADOR,
});

export const resetColaborador = () => ({
  type: types.RESET_COLABORADOR,
});

export const resetUser = () => ({
  type: types.RESET_USER,
});

export const setAlerta = (alerta: any) => ({
  type: types.SET_ALERTA,
  alerta,
});

export const unlinkColaborador = (vinculoId: string | number) => ({
  type: types.UNLINK_COLABORADOR,
  vinculoId,
});

export const allMetas = () => ({
  type: types.ALL_METAS,
});

export const checkUser = () => ({
  type: types.CHECK_USER,
});

export const updateUser = (userAccount: any) => ({
  type: types.UPDATE_USER,
  userAccount,
});
