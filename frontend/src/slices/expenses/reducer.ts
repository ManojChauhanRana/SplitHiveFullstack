import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
  expenses: [],
  loading: false,
  error: "",
};

const expenseSlice = createSlice({
  name: "expense",
  initialState,
  reducers: {
    getExpensesSuccess(state, action) {
      state.expenses = action.payload;
      state.loading = false;
      state.error = "";
    },
    expenseApiError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  getExpensesSuccess,
  expenseApiError
} = expenseSlice.actions;

export default expenseSlice.reducer;
