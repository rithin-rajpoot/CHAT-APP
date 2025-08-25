import { axiosInstance } from "../components/utilities/axiosInstance";

export const fetchMessages = async ({ receiverId, cursor = null, limit = 20 }) => {
  const res = await axiosInstance.get(`/message/get-messages/${receiverId}`, {
    params: { cursor, limit },
  });
  return res.data; // { success, messages, nextCursor }
};
