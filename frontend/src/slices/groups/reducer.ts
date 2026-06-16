import { createSlice } from "@reduxjs/toolkit";

export interface GroupMember {
  id?: number | string;
  full_name?: string;
  email?: string;
  [key: string]: any;
}

export interface GroupDetail {
  id?: number | string;
  name?: string;
  members?: GroupMember[];
  [key: string]: any;
}

interface GroupState {
  groups: any[];
  groupDetail: GroupDetail;
  loading: boolean;
  error: string;
}

export const initialState: GroupState = {
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
