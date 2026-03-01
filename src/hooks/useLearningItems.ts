import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useLearningItems = () => {
  return useQuery({
    queryKey: ["learning_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_items")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useAddLearningItem = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { topic: string; course: string }) => {
      const { error } = await supabase.from("learning_items").insert({
        user_id: user!.id,
        topic: input.topic,
        course: input.course,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning_items"] });
    },
  });
};

export const useReviewLearningItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      currentMastery: number;
      reviewCount: number;
    }) => {
      const newMastery = Math.min(100, input.currentMastery + 10);
      const nextReviewDays = Math.pow(2, input.reviewCount);
      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + nextReviewDays);

      const { error } = await supabase
        .from("learning_items")
        .update({
          mastery: newMastery,
          review_count: input.reviewCount + 1,
          last_reviewed_at: new Date().toISOString(),
          next_review_at: nextReview.toISOString(),
        })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning_items"] });
    },
  });
};

export const useDeleteLearningItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("learning_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning_items"] });
    },
  });
};
