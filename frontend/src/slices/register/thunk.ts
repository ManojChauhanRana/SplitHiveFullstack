import { post } from "../../helpers/api_helper";
import { POST_REGISTER } from "../../helpers/url_helper";
import { registerUserSuccessful, registerUserFailed } from "./reducer";

export const registerUser = (user: any, history?: any) => async (dispatch: any) => {
  try {
    const response: any = await post(POST_REGISTER, { user });
    if (response) {
      if (response.confirmation_required) {
        localStorage.removeItem("authUser");
        localStorage.removeItem("token");
        dispatch(registerUserSuccessful(response));
        return;
      }

      localStorage.setItem("authUser", JSON.stringify(response.data));
      dispatch(registerUserSuccessful(response));
      if (history) {
        history(response.joined_group_id ? `/groups/${response.joined_group_id}` : "/dashboard");
      }
    }
  } catch (error: any) {
    dispatch(registerUserFailed(error.response?.data?.message || "Registration Failed"));
  }
};
