import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
  groups: [],
  groupDetail: {},
  loading: false,
  error: "",
};

const groupSlice = createSlice({
  name: "group",
  initialState,
  reducers: {
    getGroupsSuccess(state, action) {
      state.groups = action.payload;
      state.loading = false;
    },
    getGroupDetailSuccess(state, action) {
      state.groupDetail = action.payload;
      state.loading = false;
    },
    groupApiError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  getGroupsSuccess,
  getGroupDetailSuccess,
  groupApiError
} = groupSlice.actions;

export default groupSlice.reducer;
