import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";

export interface Project {
  id: string;
  title: string;
  client: string;
  description?: string;
  location?: string;
  metric?: string;
  category: string;
  status: "Draft" | "In Progress" | "Live";
  date: string;
  thumbnail?: string;
  live_url?: string;
  images?: string[];
  order: number;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  tag?: string;
  outcome?: string;
  price: number;
  features?: string[];
  active: boolean;
  bookings: number;
  order: number;
  link?: string;
}

export interface Podcast {
  id: string;
  title: string;
  host: string;
  guest?: string;
  duration?: string;
  link: string;
  category?: string;
  plays: number;
  thumbnail?: string;
  published_at: string;
  episode_number?: string;
  description?: string;
}

export interface Testimonial {
  id: string;
  author: string;
  role?: string;
  rating: number;
  text: string;
  avatar?: string;
  approved: boolean;
  order: number;
}

export interface AboutHero {
  id: string;
  label?: string;
  title_main?: string;
  title_gold?: string;
  description?: string;
  image?: string;
  active: boolean;
  vision_label?: string;
  vision_title_main?: string;
  vision_title_gold?: string;
  vision_content_1?: string;
  vision_content_2?: string;
  quote_text?: string;
  quote_attribution?: string;
  diff_label?: string;
  diff_title_main?: string;
  diff_title_gold?: string;
}

export interface AboutDifference {
  id: string;
  title: string;
  description: string;
  order: number;
  active: boolean;
}

export interface Achievement {
  id: string;
  value: string;
  label: string;
  description?: string;
  order: number;
  active: boolean;
}

export interface TimelineEvent {
  id: string;
  year_or_age: string;
  title: string;
  description?: string;
  is_notable: boolean;
  order: number;
}

export interface HeroSlide {
  id: string;
  type: "networking" | "taxes" | "podcast" | "ads";
  title1?: string;
  title2?: string;
  title3?: string;
  title4?: string;
  location?: string;
  date_text?: string;
  theme_color?: string;
  mask_style?: string;
  bg_image?: string;
  portrait_image?: string;
  link?: string;
  active: boolean;
  order: number;
}

export interface SocialStat {
  id: string;
  platform: string;
  value: string;
  label: string;
  icon_key?: string;
  active: boolean;
  order: number;
}

export interface WeeklyZoomSetting {
  id?: string;
  title: string;
  host: string;
  session_day: string;
  session_time: string;
  zoom_link?: string;
  meeting_id?: string;
  passcode?: string;
  description?: string;
  sessions_per_year: string;
  active_members: string;
  minutes_per_session: string;
  active: boolean;
}

export interface WeeklyZoomExpectation {
  id: string;
  icon_key: string;
  title: string;
  description?: string;
  order: number;
  active: boolean;
}

export interface WeeklyZoomInclude {
  id: string;
  text: string;
  order: number;
  active: boolean;
}

export interface WeeklyZoomSchedule {
  id: string;
  label: string;
  day: string;
  time: string;
  tag: string;
  order: number;
  active: boolean;
}

export interface WeeklyZoomTestimonial {
  id: string;
  name: string;
  title?: string;
  sessions?: string;
  quote: string;
  rating: number;
  order: number;
  active: boolean;
}

export interface LiveEvent {
  id: string;
  title: string;
  location?: string;
  date?: string;
  theme?: string;
  spots?: string;
  status: string;
  register_url?: string;
  order: number;
  active: boolean;
}

export interface LiveEventFeature {
  id: string;
  icon_key: string;
  title: string;
  description?: string;
  order: number;
  active: boolean;
}

export interface LiveEventTicketTier {
  id: string;
  name: string;
  price: string;
  tag?: string;
  description?: string;
  perks: string[];
  cta: string;
  highlight: boolean;
  order: number;
  active: boolean;
}

export interface LiveEventTestimonial {
  id: string;
  name: string;
  title?: string;
  event?: string;
  quote: string;
  rating: number;
  order: number;
  active: boolean;
}
export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  active: boolean;
  unsubscribed_at?: string;
  created_at: string;
}

export function useCms<T extends { id: string }>(resource: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [resource],
    queryFn: async () => {
      const response = await api.get(`/${resource}`);
      return response.data.data as T[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post(`/${resource}`, data);
      return response.data.data as T;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resource] });
      toast.success(`${resource.slice(0, -1)} created successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (payload instanceof FormData) {
        const id = payload.get("id");
        payload.append("_method", "PUT");
        const url = id ? `/${resource}/${id}` : `/${resource}`;
        const response = await api.post(url, payload);
        return response.data.data as T;
      } else {
        const { id, ...data } = payload;
        const url = id ? `/${resource}/${id}` : `/${resource}`;
        const response = await api.put(url, data);
        return response.data.data as T;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resource] });
      toast.success(`${resource.slice(0, -1)} updated successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/${resource}/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resource] });
      toast.success(`${resource.slice(0, -1)} deleted successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete");
    },
  });

  return {
    items: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    reorder: async (ids: string[]) => {
      try {
        await api.post(`/${resource}/reorder`, { ids });
        queryClient.invalidateQueries({ queryKey: [resource] });
        toast.success("Order updated successfully");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to update order");
      }
    },
    isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
}
