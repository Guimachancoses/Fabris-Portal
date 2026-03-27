import { takeLatest, all, call, put, select, delay } from "redux-saga/effects";

import types from "./types";
import api from "@/src/services/api";
import { resetMeta, setAlerta, updateMeta } from "./actions";

/* =========================
 * Sagas
 * ========================= */

// Função para buscar todas as metas
export function* addMetas() {
    const { meta, form } = yield select((state: any) => state.metas);
    try {
        yield put(updateMeta({ ...form, disabled: true, saving: true }))
        const { data: res } = yield call(api.post, `/metas`, meta);
        if (res.error) {
            yield put(setAlerta({
                open: true,
                severity: "error",
                title: "Erro",
                message: res.message,
            }));
            yield put(updateMeta({ ...form, disabled: false, saving: false }))
            return;
        }
        yield put(updateMeta({ metas: res.metas }));
        yield put(updateMeta({ ...form, disabled: false, saving: false }))

        yield put(setAlerta({
            open: true,
            severity: "success",
            title: "Sucesso",
            message: "Meta adicionada com sucesso",
        }));
        yield put(resetMeta());
        yield delay(1000);
    } catch (err: unknown) {
        yield put(setAlerta({
            open: true,
            severity: "error",
            title: "Erro",
            message: (err as Error).message,
        }));
        yield put(updateMeta({ ...form, disabled: false, saving: false }))
    }
}

/* =========================
 * Root Saga
 * ========================= */

export default all([
    takeLatest(types.ADD_META, addMetas),
]); 