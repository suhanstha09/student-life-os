import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useNotes = () => {
  return useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useAddNote = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      content: string;
      tags: string[];
      color: string;
      attachments: string[];
      files?: FileList;
    }) => {
      let attachments: string[] = input.attachments || [];

      if (input.files && input.files.length > 0) {
        for (const file of Array.from(input.files)) {
          const filePath = `${user!.id}/${Date.now()}_${file.name}`;
          const { data, error } = await supabase.storage
            .from("note-attachments")
            .upload(filePath, file, { upsert: true });
          if (error) throw error;

          const { data: urlData } = supabase.storage
            .from("note-attachments")
            .getPublicUrl(filePath);
          if (urlData?.publicUrl) attachments.push(urlData.publicUrl);
        }
      }

      const { error } = await supabase.from("notes").insert({
        user_id: user!.id,
        title: input.title,
        content: input.content,
        tags: input.tags,
        color: input.color,
        attachments,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
};

export const useDeleteNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
};
