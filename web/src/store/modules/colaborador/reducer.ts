import { produce } from "immer";
import types from "./types";
import _ from "lodash";

/* =======================
 * Tipos do estado
 * ======================= */

export interface ColaboradorState {
  behavior: "create" | "update";
  components: {
    drawer: boolean;
    confirmDelete: boolean;
    firstSteps: boolean;
  };
  form: {
    filtering: boolean;
    disabled: boolean;
    saving: boolean;
  };
  colaboradores: any[];
  lojas: any[];
  colaborador: {
    metas: any[];
    empresas: [{
      vinculoId: string;
      status: string;
      loja: {
        nome: string;
        email: string;
      };
    }];
    vinculo: {
      id: string;
      status: string;
      lojaId: string
    };
    telefone: {
      area: string;
      numero: string;
    };
    email: string;
    nome: string;
    sobrenome: string;
    recipientId: string;
    first: boolean;
  };
  alerta: {
    severity: "" | "success" | "error" | "info" | "warning";
    message: string;
    title: string;
    open: boolean;
  };
  userAccount: {
    colaboradorId: string;
    meta: string;
    faturamento: string;
    email: string;
    firstName: string;
    lastName: string;
    imageUrl: string;
    userIdClerk: string;
    funcao: string;
    lojaId: string;
    first: boolean;
    checked: boolean;
  };
}

/* =======================
 * Estado inicial
 * ======================= */

const INITIAL_STATE: ColaboradorState = {
  behavior: "create",
  components: {
    drawer: false,
    confirmDelete: false,
    firstSteps: true,
  },
  form: {
    filtering: false,
    disabled: true,
    saving: false,
  },
  colaboradores: [],
  lojas: [],
  colaborador: {
    metas: [],
    empresas: [{
      vinculoId: '',
      status: '',
      loja: {
        nome: '',
        email: '',
      },
    },],
    vinculo: {
      id: '',
      status: '',
      lojaId: '',
    },
    telefone: { area: "55", numero: "" },

    email: "",
    nome: "",
    sobrenome: "",
    recipientId: "",
    first: true,
  },
  alerta: {
    severity: "",
    message: "",
    title: "",
    open: false,
  },
  userAccount: {
    colaboradorId: "",
    email: "",
    firstName: "",
    lastName: "",
    imageUrl: "",
    userIdClerk: '',
    funcao: '',
    meta: '',
    faturamento: '',
    lojaId: '',
    first: true,
    checked: false,
  },
};

type UpdateColaboradorPayload = Partial<ColaboradorState>;

/* =======================
 * Reducer
 * ======================= */

function colaborador(
  state: ColaboradorState = INITIAL_STATE,
  action: any,
): ColaboradorState {
  switch (action.type) {
    case types.UPDATE_COLABORADOR:
      return produce(state, (draft) => {
        const payload = action.payload as UpdateColaboradorPayload;

        /* =========================
         * Atualiza colaboradores
         * ========================= */
        if (Array.isArray(payload.colaboradores)) {
          draft.colaboradores = _.uniqBy(
            [...payload.colaboradores, ...draft.colaboradores],
            "_id"
          );
        }

        /* =========================
         * Atualiza resto do estado
         * ========================= */
        (Object.keys(payload) as Array<keyof ColaboradorState>).forEach((key) => {
          if (key === "colaboradores") return;

          if (Array.isArray(payload.colaboradores)) return;

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

    case types.RESET_COLABORADOR:
      return produce(state, (draft) => {
        draft.colaborador = INITIAL_STATE.colaborador;
        draft.form = INITIAL_STATE.form;
        draft.components = INITIAL_STATE.components;
      });

    case types.SET_ALERTA:
      return produce(state, (draft) => {
        if (action.alerta) {
          draft.alerta = action.alerta;
        }
      });

    case types.UPDATE_USER:
      return produce(state, (draft) => {
        if (action.userAccount) {
          draft.userAccount = { ...state.userAccount, ...action.userAccount };
        }
      });

    case types.RESET_USER:
      return produce(state, (draft) => {
        draft.colaboradores = INITIAL_STATE.colaboradores
        draft.userAccount = INITIAL_STATE.userAccount;
      });

    default:
      return state;
  }
}

export default colaborador;
