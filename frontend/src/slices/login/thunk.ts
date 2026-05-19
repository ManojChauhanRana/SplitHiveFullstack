import { post, del } from "../../helpers/api_helper";
import { POST_LOGIN, POST_LOGOUT } from "../../helpers/url_helper";
import { loginSuccess, logoutUserSuccess, apiError, reset_login_flag } from "./reducer";

export const loginUser = (user: any, history: any) => async (dispatch: any) => {
  try {
    const response: any = await post(POST_LOGIN, { user });
    if (response) {
      // In Rails Devise-JWT, the token is often in the headers, 
      // but if we use a specific responder it might be in the body.
      // Assuming our backend includes it in the data or we use the interceptor.
      localStorage.setItem("authUser", JSON.stringify(response.data));
      dispatch(loginSuccess(response.data));
      history(response.joined_group_id ? `/groups/${response.joined_group_id}` : "/dashboard");
    }
  } catch (error: any) {
    dispatch(apiError(error.response?.data?.message || "Login Failed"));
  }
};

export const logoutUser = () => async (dispatch: any) => {
  try {
    await del(POST_LOGOUT, {});
    localStorage.removeItem("authUser");
    localStorage.removeItem("token");
    dispatch(logoutUserSuccess());
  } catch (error: any) {
    dispatch(apiError(error.response?.data?.message || "Logout Failed"));
  }
};

export const resetLoginFlag = () => async (dispatch: any) => {
  try {
    const response = dispatch(reset_login_flag());
    return response;
  } catch (error) {
    dispatch(apiError(error));
  }
};
