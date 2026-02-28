import { ENDPOINT } from "./endpoint";
import api from "./api.axiosInstance";

export const getAllMessages = (user, receiver) => {
  return api.get(ENDPOINT.MESSAGES, {
    params: {
      sender: user,
      receiver,
    },
  });
};
