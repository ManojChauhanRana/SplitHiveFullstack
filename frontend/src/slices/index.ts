import { combineReducers } from "@reduxjs/toolkit";

// authentication
import loginReducer from "./login/reducer";
import registerReducer from "./register/reducer";
// groups
import groupReducer from "./groups/reducer";
// expenses
import expenseReducer from "./expenses/reducer";

const rootReducer = combineReducers({
  Login: loginReducer,
  Register: registerReducer,
  Group: groupReducer,
  Expense: expenseReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
