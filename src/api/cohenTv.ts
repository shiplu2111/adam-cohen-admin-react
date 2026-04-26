import api from "@/lib/axios";

export interface CohenTv {
  id: number;
  platform_name: string | null;
  name: string | null;
  subscribers: string | null;
  logo: string | null;
  url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export const getCohenTvs = async () => {
  const response = await api.get('/cohen-tvs');
  return response.data;
};

export const createCohenTv = async (formData: FormData) => {
  const response = await api.post('/cohen-tvs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateCohenTv = async (id: number, formData: FormData) => {
  formData.append('_method', 'PUT'); // Laravel requires this for multipart/form-data PUT
  const response = await api.post(`/cohen-tvs/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteCohenTv = async (id: number) => {
  const response = await api.delete(`/cohen-tvs/${id}`);
  return response.data;
};
