import { get, post } from "../../helpers/api_helper";
import { GET_GROUPS, POST_GROUP, GET_GROUP_DETAIL } from "../../helpers/url_helper";
import { getGroupsSuccess, getGroupDetailSuccess, groupApiError } from "./reducer";

export const fetchGroups = () => async (dispatch: any) => {
  try {
    const response: any = await get(GET_GROUPS);
    dispatch(getGroupsSuccess(response));
  } catch (error: any) {
    dispatch(groupApiError(error.response?.data?.message || "Failed to fetch groups"));
  }
};

export const addNewGroup = (groupData: any, history: any) => async (dispatch: any) => {
  try {
    const response: any = await post(POST_GROUP, { group: groupData });
    if (response) {
      dispatch(fetchGroups());
      history("/dashboard");
    }
  } catch (error: any) {
    dispatch(groupApiError(error.response?.data?.message || "Failed to add group"));
  }
};

export const fetchGroupDetail = (id: string) => async (dispatch: any) => {
  try {
    const response: any = await get(GET_GROUP_DETAIL(id));
    dispatch(getGroupDetailSuccess(response));
  } catch (error: any) {
    dispatch(groupApiError(error.response?.data?.message || "Failed to fetch group detail"));
  }
};
