import { get, post } from "../../helpers/api_helper";
import { GET_EXPENSES, POST_EXPENSE } from "../../helpers/url_helper";
import { getExpensesSuccess, expenseApiError } from "./reducer";

const expenseErrorMessage = (error: any, fallback: string) => {
  const data = error.response?.data;
  if (data?.message) return data.message;
  if (data && typeof data === "object") {
    return Object.values(data).flat().join(", ") || fallback;
  }
  return fallback;
};

export const fetchExpenses = (groupId: string) => async (dispatch: any) => {
  try {
    const response: any = await get(GET_EXPENSES(groupId));
    dispatch(getExpensesSuccess(response));
  } catch (error: any) {
    dispatch(expenseApiError(expenseErrorMessage(error, "Failed to fetch expenses")));
  }
};

export const addNewExpense = (groupId: string, expenseData: any, participants: any, history: any) => async (dispatch: any) => {
  try {
    const response: any = await post(POST_EXPENSE(groupId), { 
      expense: expenseData,
      participants: participants 
    });
    if (response) {
      dispatch(fetchExpenses(groupId));
      // Navigate back or show success
    }
  } catch (error: any) {
    dispatch(expenseApiError(expenseErrorMessage(error, "Failed to add expense")));
  }
};
