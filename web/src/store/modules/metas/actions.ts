import types from "./types"

/* =======================
 * Action Creators
 * ======================= */

export const addMeta = (meta: any) => ({
    type: types.ADD_META,
    meta,
});

export const updateMeta = (payload: any) => ({
    type: types.UPDATE_META,
    payload,
});

export const unlinkMeta = (meta: any) => ({
    type: types.UNLINK_META,
    meta,
});

export const resetMeta = () => ({
    type: types.RESET_META
});

export const setAlerta = (alerta: any) => ({
    type: types.SET_ALERTA,
    alerta,
});