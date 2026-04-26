import api from "@/lib/axios";
import { CohenTv } from "./cohenTv";

export interface CohenTvVideo {
  id: number;
  cohen_tv_id: number;
  title: string;
  host: string | null;
  duration: string | null;
  date: string | null;
  link: string;
  order: number;
  is_published: boolean;
  channel?: CohenTv;
  created_at?: string;
  updated_at?: string;
}

export const getCohenTvVideos = async () => {
  const response = await api.get('/cohen-tv-videos');
  return response.data;
};

export const createCohenTvVideo = async (data: Partial<CohenTvVideo>) => {
  const response = await api.post('/cohen-tv-videos', data);
  return response.data;
};

export const updateCohenTvVideo = async (id: number, data: any) => {
  if (data instanceof FormData) {
    data.append('_method', 'PUT');
    const response = await api.post(`/cohen-tv-videos/${id}`, data);
    return response.data;
  }
  const response = await api.put(`/cohen-tv-videos/${id}`, data);
  return response.data;
};

export const deleteCohenTvVideo = async (id: number) => {
  const response = await api.delete(`/cohen-tv-videos/${id}`);
  return response.data;
};
