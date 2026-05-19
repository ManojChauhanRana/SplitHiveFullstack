import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
  registrationError: "",
  message: "",
  loading: false,
  user: null,
  success: false
};

const registerSlice = createSlice({
  name: "register",
  initialState,
  reducers: {
    registerUserSuccessful(state, action) {
      state.user = action.payload?.data;
      state.message = action.payload?.status?.message || "Account created successfully.";
      state.loading = false;
      state.success = true;
      state.registrationError = "";
    },
    registerUserFailed(state, action) {
      state.user = null;
      state.loading = false;
      state.registrationError = action.payload;
      state.success = false;
    },
    resetRegisterFlag(state) {
      state.success = false;
      state.registrationError = "";
    }
  },
});

export const {
  registerUserSuccessful,
  registerUserFailed,
  resetRegisterFlag
} = registerSlice.actions;

export default registerSlice.reducer;
