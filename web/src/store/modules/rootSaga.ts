import { all } from "redux-saga/effects";

import loja from "./loja/sagas";
import colaborador from "./colaborador/sagas";
import metas from "./metas/sagas";

export default function* rootSaga(): Generator {
  yield all([
    colaborador,
    loja,
    metas,
  ]);
}
