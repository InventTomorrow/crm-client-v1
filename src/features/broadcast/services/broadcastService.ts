import { apiClient } from "@/lib/apiClient";
import type {
  Broadcast,
  CreateBroadcastPayload,
  CreateBroadcastResult,
} from "../types";

export const broadcastService = {
  create: async (
    payload: CreateBroadcastPayload,
  ): Promise<CreateBroadcastResult> => {
    const { data } = await apiClient.post("/broadcasts", payload);
    return data.data;
  },

  getById: async (id: string): Promise<Broadcast> => {
    const { data } = await apiClient.get(`/broadcasts/${id}`);
    return data.data;
  },
};
