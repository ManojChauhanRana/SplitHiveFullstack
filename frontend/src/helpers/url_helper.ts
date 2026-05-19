// AUTH
export const POST_LOGIN = "/users/sign_in";
export const POST_REGISTER = "/users";
export const POST_LOGOUT = "/users/sign_out";
export const POST_PASSWORD_FORGOT = "/users/password";
export const PUT_PASSWORD_RESET = "/users/password";
export const POST_DEMO_PREPARE = "/demo/prepare";

// GROUPS
export const GET_GROUPS = "/groups";
export const POST_GROUP = "/groups";
export const GET_GROUP_DETAIL = (id: string) => `/groups/${id}`;
export const POST_INVITE = (id: string) => `/groups/${id}/invites`;
export const POST_PLATFORM_INVITE = "/invites/platform";
export const POST_ACCEPT_INVITE = "/invites/accept";

// EXPENSES
export const GET_EXPENSES = (groupId: string) => `/groups/${groupId}/expenses`;
export const POST_EXPENSE = (groupId: string) => `/groups/${groupId}/expenses`;

// SETTLEMENTS
export const GET_SETTLEMENTS = (groupId: string) => `/groups/${groupId}/settlements`;
export const POST_SETTLEMENT = (groupId: string) => `/groups/${groupId}/settlements`;
