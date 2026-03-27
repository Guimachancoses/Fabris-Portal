import { produce } from "immer";
import types from "./types";
import _ from "lodash";

/* =======================
 * Tipos do estado
 * ======================= */

interface State {
  behavior: "create" | "update";
  components: {
    drawer: boolean;
    confirmDelete: boolean;
    firstSteps: boolean;
  };
  lojas: any[];
  objetivos: {
    loja: {
      ano: string;
      mes: string;
      meta: string;
      faturamento: string;
    };
    colaboradores: any[];
  };
  loja: {
    colaboradorId: string;
    nome: string;
    email: string;
    meta: string;
    status: string;
    dataInicio: string;
    faturamento: string;
  };
  lojaAccount: {
    nome: string;
    email: string;
    meta: string;
    status: string;
    dataInicio: string;
    faturamento: string;
    periodos: any[];
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
}

/* =======================
 * Estado inicial
 * ======================= */

const INITIAL_STATE: State = {
  behavior: "create",
  components: {
    drawer: false,
    confirmDelete: false,
    firstSteps: true,
  },
  lojas: [],
  objetivos: {
    loja: {
      ano: '',
      mes: '',
      meta: '',
      faturamento: '',
    },
    colaboradores: [],
  },
  loja: {
    colaboradorId: '',
    nome: '',
    email: '',
    meta: '',
    status: '',
    dataInicio: '',
    faturamento: '',
  },
  lojaAccount: {
    nome: '',
    email: '',
    meta: '',
    status: '',
    dataInicio: '',
    faturamento: '',
    periodos: [],
  },
  alerta: {
    severity: "",
    message: "",
    title: "",
    open: false,
  },
  form: {
    filtering: false,
    disabled: true,
    saving: false
  },
};

type UpdateLojaPayload = Partial<State>;

/* =======================
 * Reducer
 * ======================= */

function loja(
  state = INITIAL_STATE,
  action: any,
): State {
  switch (action.type) {
    case types.UPDATE_LOJA:
      return produce(state, (draft) => {
        const payload = action.payload as UpdateLojaPayload;

        /* =========================
         * Atualiza LOJAS
         * ========================= */
        if (Array.isArray(payload.lojas)) {
          draft.lojas = _.uniqBy(
            [...payload.lojas, ...draft.lojas],
            "_id"
          );
        }

        /* =========================
         * Atualiza resto do estado
         * ========================= */
        (Object.keys(payload) as Array<keyof State>).forEach((key) => {
          if (key === "lojas") return;

          if (Array.isArray(payload.lojas)) return;

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

    case types.UPDATE_METAS:
      return produce(state, (draft) => {
        draft.objetivos = action.payload.objetivos;
      });

    case types.UPDATE_FORM:
      return produce(state, (draft) => {
        draft.form = { ...state.form, ...action.form };

      });
    case types.UPDATE_LOJA_ACCOUNT:
      return produce(state, (draft) => {
        if (action.lojaAccount) {
          draft.lojaAccount = { ...state.lojaAccount, ...action.lojaAccount };
        }
      });

    case types.SET_ALERTA_LOJA:
      return produce(state, (draft) => {
        if (action.alerta) {
          draft.alerta = action.alerta;
        }
      });

    case types.RESET_LOJA:
      return produce(state, (draft) => {
        draft.loja = INITIAL_STATE.loja;
        draft.components = INITIAL_STATE.components;
        draft.form = INITIAL_STATE.form;
      });

    case types.RESET_LOJA_ACCOUNT:
      return produce(state, (draft) => {
        draft.lojaAccount = INITIAL_STATE.lojaAccount;
      });

    default:
      return state;
  }
}

export default loja;
