import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";

interface GroupMember {
  id: string;
  name: string;
  user_id: string | null;
  goals_reached: number;
  total_contributed: number;
}

interface ProgressEntry {
  id: string;
  group_id: string;
  member_id: string;
  user_id: string;
  amount: number;
  description: string | null;
  created_at: string;
  member_name: string;
}

export const useGroupDetails = (groupId: string | undefined) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch group details
  const { data: group, isLoading: groupLoading } = useQuery({
    queryKey: ["group", groupId],
    queryFn: async () => {
      if (!groupId) return null;

      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .eq("id", groupId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!groupId,
  });

  // Fetch group members with their total contributions
  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ["groupMembers", groupId],
    queryFn: async () => {
      if (!groupId) return [];

      const { data: membersData, error: membersError } = await supabase
        .from("group_members")
        .select("*")
        .eq("group_id", groupId);

      if (membersError) throw membersError;

      // Get total contributions for each member
      const { data: progressData } = await supabase
        .from("goal_progress")
        .select("member_id, amount")
        .eq("group_id", groupId);

      const contributionsByMember = (progressData || []).reduce((acc, entry) => {
        acc[entry.member_id] = (acc[entry.member_id] || 0) + entry.amount;
        return acc;
      }, {} as Record<string, number>);

      return membersData.map((member) => ({
        ...member,
        total_contributed: contributionsByMember[member.id] || 0,
      })) as GroupMember[];
    },
    enabled: !!groupId,
  });

  // Fetch progress entries
  const { data: progressEntries, isLoading: progressLoading } = useQuery({
    queryKey: ["groupProgress", groupId],
    queryFn: async () => {
      if (!groupId) return [];

      const { data, error } = await supabase
        .from("goal_progress")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get member names
      const memberIds = [...new Set(data.map((p) => p.member_id))];
      const { data: membersData } = await supabase
        .from("group_members")
        .select("id, name")
        .in("id", memberIds);

      const memberNames = (membersData || []).reduce((acc, m) => {
        acc[m.id] = m.name;
        return acc;
      }, {} as Record<string, string>);

      return data.map((entry) => ({
        ...entry,
        member_name: memberNames[entry.member_id] || "Membro",
      })) as ProgressEntry[];
    },
    enabled: !!groupId,
  });

  // Calculate total progress
  const totalProgress = (progressEntries || []).reduce((sum, entry) => sum + entry.amount, 0);

  // Get current user's member record
  const userMember = members?.find((m) => m.user_id === user?.id);

  // Add progress mutation
  const addProgress = useMutation({
    mutationFn: async ({ 
      memberId, 
      amount, 
      description 
    }: { 
      memberId: string; 
      amount: number; 
      description?: string;
    }) => {
      if (!user || !groupId) throw new Error("Dados inválidos");

      const { data, error } = await supabase
        .from("goal_progress")
        .insert([{
          group_id: groupId,
          member_id: memberId,
          user_id: user.id,
          amount,
          description,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupProgress", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] });
      toast({
        title: "Doação registrada! 🎉",
        description: "Sua contribuição foi adicionada ao progresso do grupo.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao registrar doação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete progress mutation
  const deleteProgress = useMutation({
    mutationFn: async (progressId: string) => {
      const { error } = await supabase
        .from("goal_progress")
        .delete()
        .eq("id", progressId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupProgress", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] });
      toast({
        title: "Registro removido",
        description: "A doação foi removida do histórico.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover registro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    group,
    members,
    progressEntries,
    totalProgress,
    userMember,
    isLoading: groupLoading || membersLoading || progressLoading,
    addProgress,
    deleteProgress,
  };
};