import { combineReducers } from "redux";

import loja from "./loja/reducer";
import colaborador from "./colaborador/reducer";
import metas from "./metas/reducer";

const rootReducer = combineReducers({
  loja,
  colaborador,
  metas,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
