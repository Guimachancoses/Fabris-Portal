import { produce } from "immer";
import types from "./types";
import _ from "lodash";

/* =======================
 * Tipos do estado
 * ======================= */

interface State {
    metas: any[];
    meta: {
        ano: string;
        mes: string;
        meta: string;
        faturamento: string;
    };
    alerta: {
        severity: "" | "success" | "error" | "info" | "warning";
        message: string;
        title: string;
        open: boolean;
    };
    form: {
        filtering: boolean;
        disabled: boolean;
        saving: boolean;
    };
    components: {
        drawer: boolean;
        confirmDelete: boolean;
        firstSteps: boolean;
    };
    behavior: "create" | "update";
}

const INITIAL_STATE: State = {
    alerta: {
        severity: "",
        message: "",
        title: "",
        open: false,
    },
    form: {
        filtering: false,
        disabled: false,
        saving: false,
    },
    components: {
        drawer: false,
        confirmDelete: false,
        firstSteps: false,
    },
    behavior: "create",
    metas: [],
    meta: {
        ano: "",
        mes: "",
        meta: "",
        faturamento: "",
    },
}

type UpdateMetaPayload = Partial<State>;

function metas(
    state = INITIAL_STATE,
    action: any
): State {
    switch (action.type) {
        case types.UPDATE_META:
            return produce(state, (draft) => {
                const payload = action.payload as UpdateMetaPayload;

                /* =========================
                 * Atualiza METAS
                 * ========================= */
                if (Array.isArray(payload.metas)) {
                    draft.metas = _.uniqBy(
                        [...payload.metas, ...draft.metas],
                        "_id"
                    );
                }

                /* =========================
                 * Atualiza resto do estado
                 * ========================= */
                (Object.keys(payload) as Array<keyof State>).forEach((key) => {
                    if (key === "metas") return;

                    if (Array.isArray(payload.metas)) return;

                    const value = payload[key];

                    if (
                        typeof value === "object" &&
                        value !== null &&
                        !Array.isArray(value)
                    ) {
                        draft[key] = {
                            ...(draft[key] as object),
                            ...(value as object),
                        } as any;
                    } else if (value !== undefined) {
                        draft[key] = value as any;
                    }
                });
            });
        case types.RESET_META:
            return produce(state, (draft) => {
                draft.meta = INITIAL_STATE.meta;
            });
        case types.SET_ALERTA:
            return produce(state, (draft) => {
                draft.alerta = action.alerta;
            });
        default:
            return state;
    }
}

export default metas;