import types from "./types"

/* =======================
 * Action Creators
 * ======================= */

export const getLoja = () => ({
    type: types.GET_LOJA,
  });

export const allLojas = () => ({
    type: types.ALL_LOJAS,
});

export const updateLojaAccount = (lojaAccount: any) => ({
    type: types.UPDATE_LOJA_ACCOUNT,
    lojaAccount,
});

export const updateLoja = (payload: any) => ({
    type: types.UPDATE_LOJA,
    payload,
});

export const allUpdateLoja = () => ({
    type: types.UPDATE_ALL_LOJA,
  });

export const allMesesAnos = () => ({
    type: types.ALL_MESES_ANOS,
});

export const filterLojas = (filters: any) => ({
    type: types.FILTER_LOJAS,
    filters
});

export const addLoja = () => ({
    type: types.ADD_LOJA,
});

export const resetLoja = () => ({
    type: types.RESET_LOJA,
});

export const resetLojaAccount = () => ({
    type: types.RESET_LOJA_ACCOUNT,
});

export const setAlerta = (alerta: any) => ({
    type: types.SET_ALERTA_LOJA,
    alerta,
});

export const unlinkLoja = () => ({
    type: types.UNLINK_LOJA,
});

export const allMetas = ( filters: any ) => ({
    type: types.ALL_METAS,
    filters
});

export const updateMetas = (payload: any) => ({
    type: types.UPDATE_METAS,
    payload,
});

export const updateForm = (form: any) => ({
    type: types.UPDATE_FORM,
    form,
});