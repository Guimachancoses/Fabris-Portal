import { takeLatest, all, call, put, select, delay } from "redux-saga/effects";

import types from "./types";
import api from "@/src/services/api";
import {
    resetLoja,
    setAlerta,
    updateLoja,
    updateLojaAccount,
    getLoja as getLojaActions,
    filterLojas as filterAllActions,
    updateMetas,
} from "./actions";

/* =========================
   Sagas
========================= */

// Função que busca o loja
export function* getLoja() {
    const { userAccount } = yield select((state: any) => state.colaborador);
    if (!userAccount?.lojaId) {
        return
    }

    try {
        const lojaIdAccount = userAccount?.lojaId;
        const { data: res } = yield call(api.get, `/loja/${lojaIdAccount}`);
        if (res.error) {
            yield put(
                setAlerta({
                    open: true,
                    severity: "error",
                    title: "Erro",
                    message: res.message || "Erro ao carregar loja",
                })
            );
            return;
        }

        //console.log("Resposta completa da API:", res);

        yield put(updateLojaAccount(res.loja));
        yield put(updateLoja({ loja: res.loja }))
    } catch (err) {
        yield put(
            setAlerta({
                open: true,
                severity: "error",
                title: "Erro inesperado",
                message:
                    err instanceof Error
                        ? err.message
                        : "Erro inesperado ao buscar loja",
            })
        );
    }
}

// Função para atualizar a loja
export function* allUpdateLoja() {
    try {
        const { loja, form } = yield select((state: any) => state.loja);

        const { data: res } = yield call(
            [api, api.put],
            "/loja/updateLoja",
            { loja }
        );

        //console.log(" Saga - resposta backend:", res);

        if (res.error) {
            yield put(
                setAlerta({
                    open: true,
                    severity: "error",
                    title: "Erro",
                    message: res.message || "Erro ao atualizar loja",
                })
            );
            return;
        }

        yield put(
            setAlerta({
                open: true,
                severity: "success",
                title: "Sucesso",
                message: "Loja atualizada com sucesso!",
            })
        );

        yield put(updateLojaAccount(res));
        yield put(
            updateLoja({
                form: { ...form, saving: false },
            })
        );
        yield put(resetLoja());

        yield put(getLojaActions());

        yield delay(5000);

    } catch (err) {
        yield put(
            setAlerta({
                open: true,
                severity: "error",
                title: "Erro inesperado",
                message:
                    err instanceof Error
                        ? err.message
                        : "Erro inesperado ao atualizar loja",
            })
        );
    }
}

// Adicionar Loja nova
export function* addLoja() {
    const { loja, form, behavior, components } = yield select((state: any) => state.loja);
    const { userAccount } = yield select((state: any) => state.colaborador);
    try {
        const isCreate = behavior === "create";
        let res;

        if (isCreate) {
            const { data: responseAdd } = yield call(
                [api, api.post],
                "/loja",
                { loja }
            );
            res = responseAdd;

            if (res.error) {
                yield put(
                    setAlerta({
                        open: true,
                        severity: "error",
                        title: "Erro",
                        message: res.message || "Erro ao acicionar loja",
                    })
                );
                return;
            }

        } else {
            const { data: responseUpdate } = yield call(
                [api, api.put],
                "/loja/updateLoja",
                { loja }
            );

            res = responseUpdate

            if (res.error) {
                yield put(
                    setAlerta({
                        open: true,
                        severity: "error",
                        title: "Erro",
                        message: res.message || "Erro ao acicionar loja",
                    })
                );
                return;
            }

        }

        yield put(
            updateLoja({
                components: { ...components, drawer: false },
                form: { ...form, saving: false },
            })
        );

        if (userAccount?.funcao === "Admin") {
            yield put(filterAllActions({}));
        } else {
            yield put(getLojaActions());
            yield put(updateLojaAccount(res));
        }

        yield put(resetLoja());
        yield put(
            setAlerta({
                open: true,
                severity: "success",
                title: "Sucesso",
                message: isCreate
                    ? "Loja cadastrada com sucesso!"
                    : "Loja atualizada com sucesso!",
            })
        );

        yield delay(5000);

    } catch (err) {
        yield put(
            setAlerta({
                open: true,
                severity: "error",
                title: "Erro inesperado",
                message:
                    err instanceof Error
                        ? err.message
                        : "Erro inesperado ao atualizar loja",
            })
        );
        yield put(
            updateLoja({
                components: { ...components, drawer: false },
                form: { ...form, saving: false },
            })
        );
        yield put(resetLoja());
    }
}

// Retorna todos os lojas pelo filtro
export function* filterLojas({ filters }: any) {
    try {

        // console.log("filters: ", filters)

        const { data: res } = yield call(api.post, "/loja/filter", { filters: filters });

        if (res.error) {
            yield put(
                setAlerta({
                    open: true,
                    severity: "error",
                    title: "Erro",
                    message: res.message || "Erro ao filtrar lojas",
                })
            );
            return;
        }

        yield put(updateLoja({ lojas: res.lojas }));
    } catch (err: unknown) {
        yield put(
            setAlerta({
                open: true,
                severity: "error",
                title: "Erro inesperado",
                message:
                    err instanceof Error
                        ? err.message
                        : "Erro inesperado ao filtrar lojas",
            })
        );
    }
}

// Retorna tas metas da loja e dos colaboradores por periodo
export function* allMetas({ filters }: any) {
    const { form } = yield select((state: any) => state.loja);

    try {
        yield put(updateLoja({ form: { ...form, filtering: true } }));

        const { data: res } = yield call(
            api.post,
            "/loja/metas/periodo", { filters }
        );

        yield put(updateLoja({ form: { ...form, filtering: false } }));

        if (res.error) {
            yield put(
                setAlerta({
                    open: true,
                    severity: "error",
                    title: "Erro",
                    message: res.message,
                })
            );
            return;
        }

        //console.log("res API: ", res)

        yield put(updateMetas({
            objetivos: {
                loja: res.loja,
                colaboradores: res.colaboradores
            }
        }));
    } catch (err: unknown) {
        yield put(
            setAlerta({
                open: true,
                severity: "error",
                title: "Erro",
                message: (err as Error).message,
            })
        );
        yield put(updateLoja({ form: { ...form, filtering: false } }));
    }
}

// Retorna todos os meses e anos de metas de uma determinada loja
export function* allMesesAnos() {
    const { lojaAccount } = yield select((state: any) => state.loja);
    try {
        const { data: res } = yield call(api.get, `/loja/metas/meses-anos/${lojaAccount._id}`);
        if (res.error) {
            yield put(
                setAlerta({
                    open: true,
                    severity: "error",
                    title: "Erro",
                    message: res.message,
                })
            );
            return;
        }

        yield put(updateLojaAccount({ periodos: res.periodos }));
    } catch (err: unknown) {
        yield put(
            setAlerta({
                open: true,
                severity: "error",
                title: "Erro",
                message: (err as Error).message,
            })
        );
    }
}

/* =========================
   Root Saga
========================= */

export default all([
    takeLatest(types.GET_LOJA, getLoja),
    takeLatest(types.UPDATE_ALL_LOJA, allUpdateLoja),
    takeLatest(types.ADD_LOJA, addLoja),
    takeLatest(types.FILTER_LOJAS, filterLojas),
    takeLatest(types.ALL_METAS, allMetas),
    takeLatest(types.ALL_MESES_ANOS, allMesesAnos),
]);
