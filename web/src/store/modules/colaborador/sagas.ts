import { takeLatest, all, call, put, select, delay } from "redux-saga/effects";
import {
  updateColaborador,
  allColaboradores as allColaboradoresActions,
  filterAllColaboradores as filterAllActions,
  resetColaborador,
  setAlerta,
  updateUser,
} from "./actions";
import types from "./types";
import api from "@/src/services/api";
import { signOutClerk } from "@/src/utils/clerk";
import { generateSecureCode } from "@/src/lib/utils";

/* =========================
   Sagas
========================= */

// Retorna todos os colaboradores da loja
export function* allColaboradores() {
  const { form, userAccount } = yield select((state: any) => state.colaborador);

  if (!userAccount?.lojaId) {
    return
  }

  try {
    yield put(updateColaborador({ form: { ...form, filtering: true } }));

    const { data: res } = yield call(
      api.get,
      `/colaborador/loja/${userAccount.lojaId}`
    );

    //console.log(res)

    yield put(updateColaborador({ form: { ...form, filtering: false } }));

    if (res.error) {
      yield put(
        setAlerta({
          open: true,
          severity: "error",
          title: "Erro",
          message: res.message || "Erro ao carregar colaboradores",
        })
      );
      return;
    }

    yield put(updateColaborador({ colaboradores: res.colaboradores }));
  } catch (err: unknown) {
    yield put(updateColaborador({ form: { ...form, filtering: false } }));
    yield put(
      setAlerta({
        open: true,
        severity: "error",
        title: "Erro inesperado",
        message:
          err instanceof Error
            ? err.message
            : "Erro inesperado ao buscar colaboradores",
      })
    );
  }
}

// Filtra os colaboradores de acordo com os parâmetros passados
export function* filterColaboradores({ filters }: any) {
  const { form, behavior } = yield select((state: any) => state.colaborador);

  try {
    const isCreate = behavior === "create";
    yield put(updateColaborador({ form: { ...form, filtering: true } }));

    // console.log("filters: ", filters)

    const { data: res } = yield call(api.post, "/colaborador/filter", { filters: filters });

    yield put(updateColaborador({ form: { ...form, filtering: false } }));

    if (res.error) {
      yield put(
        setAlerta({
          open: true,
          severity: "error",
          title: "Erro",
          message: res.message || "Erro ao filtrar colaboradores",
        })
      );
      return;
    }

    if (res.colaboradores.length > 0 && isCreate) {
      yield put(
        updateColaborador({
          behavior: "update",
          colaborador: res.colaboradores[0],
          form: { ...form, filtering: false, disabled: true },
        })
      );
    } else {
      yield put(
        updateColaborador({
          form: { ...form, disabled: false },
        })
      );
    }
  } catch (err: unknown) {
    yield put(updateColaborador({ form: { ...form, filtering: false } }));
    yield put(
      setAlerta({
        open: true,
        severity: "error",
        title: "Erro inesperado",
        message:
          err instanceof Error
            ? err.message
            : "Erro inesperado ao filtrar colaboradores",
      })
    );
  }
}

// Retorna todos os colaboradores pelo filtro
export function* filterAllColaboradores({ filters }: any) {
  try {

    // console.log("filters: ", filters)

    const { data: res } = yield call(api.post, "/colaborador/filter", { filters: filters });

    if (res.error) {
      yield put(
        setAlerta({
          open: true,
          severity: "error",
          title: "Erro",
          message: res.message || "Erro ao filtrar colaboradores",
        })
      );
      return;
    }

    const colaboradores = res.colaboradores

    yield put(updateColaborador({ colaboradores: colaboradores }));
  } catch (err: unknown) {
    yield put(
      setAlerta({
        open: true,
        severity: "error",
        title: "Erro inesperado",
        message:
          err instanceof Error
            ? err.message
            : "Erro inesperado ao filtrar colaboradores",
      })
    );
  }
}

// Adiciona ou altera um colaborador
export function* addColaborador() {
  const { form, colaborador, behavior, components, userAccount } = yield select(
    (state: any) => state.colaborador
  );

  try {
    const isCreate = behavior === "create";
    const password = generateSecureCode();
    const isDisabled = colaborador.vinculo.status === "E"
    let userLojaId;

    userLojaId = userAccount?.lojaId

    if (!userLojaId && userAccount?.funcao === "Admin") {
      userLojaId = colaborador?.vinculo?.lojaId
    }

    let res;

    if (isCreate) {
      // 1️Cria colaborador no sistema
      const { data: responseColaborador } = yield call(
        [api, api.post],
        "/colaborador",
        { lojaId: userLojaId, colaborador }
      );

      // Se deu erro, para tudo
      if (responseColaborador?.error) {
        res = responseColaborador;
        throw new Error(res.message);
      }

      // Cria usuário no Clerk
      const { data: responseClerk } = yield call(
        [api, api.post],
        "/clerk/createUser",
        {
          email: colaborador.email,
          password,
        }
      );

      res = responseClerk;
    } else if (isDisabled) {
      // UPDATE e reenvia o invite
      // Cria usuário no Clerk
      const { data: responseColaborador } = yield call(
        [api, api.post],
        "/colaborador",
        { lojaId: userAccount.lojaId, colaborador }
      );

      // Se deu erro, para tudo
      if (responseColaborador?.error) {
        res = responseColaborador;
        throw new Error(res.message);
      }

      // Cria usuário no Clerk
      const { data: responseClerk } = yield call(
        [api, api.post],
        "/clerk/createUser",
        {
          email: colaborador.email,
          password,
        }
      );

      res = responseClerk;

    } else {
      // UPDATE
      const { data: responseUpdate } = yield call(
        [api, api.put],
        `/colaborador/${colaborador.vinculo.vinculoId}`,
        {
          colaborador,
          vinculo: colaborador.vinculo.status,
          vinculoId: colaborador.vinculo.vinculoId,
          objetivos: colaborador.objetivos,
        }
      );

      // Se deu erro, para tudo
      if (responseUpdate?.error) {
        res = responseUpdate;
        throw new Error(res.message);
      }

      res = responseUpdate;
    }

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

    yield put(
      updateColaborador({
        components: { ...components, drawer: false },
        form: { ...form, saving: false },
      })
    );
    if (userAccount?.funcao === "Admin") {
      yield put(filterAllActions({}));
    } else {
      yield put(allColaboradoresActions());
    }
    yield put(resetColaborador());
    yield put(
      setAlerta({
        open: true,
        severity: "success",
        title: "Sucesso",
        message: isCreate
          ? "Colaborador cadastrado com sucesso!"
          : "Colaborador atualizado com sucesso!",
      })
    );

    yield delay(5000);

  } catch (err: unknown) {
    yield put(
      setAlerta({
        open: true,
        severity: "error",
        title: "Erro",
        message: (err as Error).message,
      })
    );
    yield put(
      updateColaborador({
        components: { ...components, drawer: false },
        form: { ...form, saving: false },
      })
    );
    yield put(resetColaborador());
  }
}

// Atualiza um colaborador
export function* allUpdateColaborador() {
  const { colaborador } = yield select((state: any) => state.colaborador);

  //console.log("🟡 Saga - colaborador enviado:", colaborador);

  try {
    const { data: res } = yield call(
      [api, api.patch],
      "/colaborador/updateColaborador",
      { colaborador }
    );

    //console.log("🟢 Saga - resposta backend:", res);

    if (res.error) {
      yield put(
        setAlerta({
          open: true,
          severity: "error",
          title: "Erro",
          message: res.message || "Erro ao atualizar colaborador",
        })
      );
      return;
    }
    yield put(resetColaborador())
  } catch (err: unknown) {
    //console.error("❌ Saga error:", err);
    yield put(
      setAlerta({
        open: true,
        severity: "error",
        title: "Erro inesperado",
        message:
          err instanceof Error
            ? err.message
            : "Erro inesperado ao atualizar colaborador",
      })
    );
  }
}

// Deleta um colaborador da loja
export function* unlinkColaborador({ vinculoId }: any) {
  const { form, components, colaborador } = yield select(
    (state: any) => state.colaborador
  );

  console.log("colaborador saga: ", colaborador)

  try {
    yield put(updateColaborador({ form: { ...form, saving: true } }));

    const { data: res } = yield call(
      api.delete,
      `/colaborador/vinculo/${vinculoId}`
    );

    yield call(api.post, "/clerk/deleteUserEmail", {
      email: colaborador.email,
      recipientId: colaborador.recipientId
    })

    yield put(updateColaborador({ form: { ...form, saving: false } }));

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

    yield put(allColaboradoresActions());
    yield put(
      updateColaborador({
        components: {
          ...components,
          drawer: false,
          confirmDelete: false,
        },
      })
    );
    yield put(resetColaborador());

    yield put(
      setAlerta({
        open: true,
        severity: "success",
        title: "Sucesso",
        message: "Colaborador excluído!",
      })
    );
  } catch (err: unknown) {
    yield put(
      setAlerta({
        open: true,
        severity: "error",
        title: "Erro",
        message: (err as Error).message,
      })
    );
    yield put(updateColaborador({ form: { ...form, saving: false } }));
  }
}

// Retorna todas as metas cadastradas
export function* allMetas() {
  const { form, userAccount } = yield select((state: any) => state.colaborador);

  try {
    yield put(updateColaborador({ form: { ...form, filtering: true } }));

    const { data: res } = yield call(
      api.get,
      `/loja/metas/${userAccount.lojaId}`
    );

    yield put(updateColaborador({ form: { ...form, filtering: false } }));

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

    yield put(updateColaborador({ metas: res?.metas }));
  } catch (err: unknown) {
    yield put(
      setAlerta({
        open: true,
        severity: "error",
        title: "Erro",
        message: (err as Error).message,
      })
    );
    yield put(updateColaborador({ form: { ...form, filtering: false } }));
  }
}

// Verifica o usuário logado
export function* checkUser() {
  const { userAccount } = yield select((state: any) => state.colaborador)

  if (!userAccount?.email) {
    return
  }

  try {
    const { data: res } = yield call(
      api.get,
      `/colaborador/check/${userAccount.email}`
    )

    // console.log("res: ", res)

    if (res.error) {
      yield put(setAlerta({
        open: true,
        severity: "error",
        title: "Erro",
        message: res.message,
      }))
      yield delay(2000)
      yield call(signOutClerk)
      return
    }

    if (res.colaborador) {
      yield put(updateUser({
        ...res.colaborador,
        colaboradorId: res.colaborador._id,
        checked: true,
      }))
      return
    }

    yield put(setAlerta({
      open: true,
      severity: "error",
      title: "Acesso negado",
      message: "Colaborador não cadastrado no sistema!",
    }))

    yield call(api.post, "/clerk/deleteUser", {
      userId: userAccount.userIdClerk,
    })

    yield delay(2000)
    yield call(signOutClerk)

  } catch (err: any) {
    yield put(setAlerta({
      open: true,
      severity: "error",
      title: "Erro",
      message: err.message,
    }))
  }
}

/* =========================
   Root Saga
========================= */

export default all([
  takeLatest(types.ALL_COLABORADORES, allColaboradores),
  takeLatest(types.FILTER_COLABORADORES, filterColaboradores),
  takeLatest(types.FILTER_ALL_COLABORADORES, filterAllColaboradores),
  takeLatest(types.ADD_COLABORADOR, addColaborador),
  takeLatest(types.UPDATE_ALL_COLABORADOR, allUpdateColaborador),
  takeLatest(types.UNLINK_COLABORADOR, unlinkColaborador),
  takeLatest(types.ALL_METAS, allMetas),
  takeLatest(types.CHECK_USER, checkUser),
]);
