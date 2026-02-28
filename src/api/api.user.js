import { ENDPOINT } from "./endpoint";
import api from "./api.axiosInstance";

export const getAllUsers = (user) => {
  return api.get(ENDPOINT.USERS, { params: { currentUser: user } });
};
