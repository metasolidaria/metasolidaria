import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useIsAdmin } from "./useIsAdmin";
import { useToast } from "@/hooks/use-toast";

interface MemberCommitment {
  id: string;
  name: string | null;
  metric: string;
  ratio: number;
  donation_amount: number;
  personal_goal: number;
  penalty_donation: number | null;
}

interface GroupMember {
  id: string;
  name: string;
  user_id: string | null;
  goals_reached: number;
  total_contributed: number;
  commitments: MemberCommitment[];
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
  const { isAdmin } = useIsAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Increment view count on first load
  useEffect(() => {
    if (groupId) {
      supabase.rpc('increment_group_view_count', { _group_id: groupId }).then(() => {
        // View count incremented
      });
    }
  }, [groupId]);

  // Fetch group details with entity (with fallback to public/admin view)
  const { data: group, isLoading: groupLoading, error: groupError } = useQuery({
    queryKey: ["group", groupId, isAdmin],
    queryFn: async () => {
      if (!groupId) return null;

      // Try to fetch full group details first
      const { data, error } = await supabase
        .from("groups")
        .select("*, entity:entities(id, name, city, accepted_donations, pix_key, pix_name, pix_qr_code_url, observations)")
        .eq("id", groupId)
        .maybeSingle();

      if (data) return { ...data, hasFullAccess: true };

      // If admin and main query failed, use admin view
      if (isAdmin) {
        const { data: adminData, error: adminError } = await supabase
          .from("groups_admin")
          .select("*")
          .eq("id", groupId)
          .maybeSingle();

        if (adminData) {
          return { ...adminData, hasFullAccess: true };
        }
        if (adminError) throw adminError;
      }

      // If no access, try public view for basic info
      const { data: publicData, error: publicError } = await supabase
        .from("groups_public" as any)
        .select("*")
        .eq("id", groupId)
        .maybeSingle() as { data: any | null, error: any };

      if (publicData) {
        return { ...publicData, hasFullAccess: false };
      }

      if (error || publicError) throw error || publicError;
      return null;
    },
    enabled: !!groupId,
  });

  // Fetch group members with their total contributions and commitments
  // Fetch group members with their total contributions and commitments
  // Using group_members_public view to respect WhatsApp visibility settings
  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ["groupMembers", groupId],
    queryFn: async () => {
      if (!groupId) return [];

      // Use group_members_public view which handles WhatsApp visibility
      // The view only exposes WhatsApp when: whatsapp_visible=true, or user is the member, leader, or admin
      const { data: membersData, error: membersError } = await supabase
        .from("group_members_public")
        .select("*")
        .eq("group_id", groupId);

      if (membersError) throw membersError;
      if (!membersData) return [];

      // Cast to array with proper typing
      const members = membersData as Array<{
        id: string;
        group_id: string;
        user_id: string | null;
        name: string;
        personal_goal: number | null;
        goals_reached: number | null;
        commitment_type: string | null;
        commitment_metric: string | null;
        commitment_ratio: number | null;
        commitment_donation: number | null;
        penalty_donation: number | null;
        created_at: string;
        updated_at: string;
        whatsapp: string | null;
      }>;

      // Get total contributions for each member
      const { data: progressData } = await supabase
        .from("goal_progress")
        .select("member_id, amount")
        .eq("group_id", groupId);

      const contributionsByMember = (progressData || []).reduce((acc, entry) => {
        acc[entry.member_id] = (acc[entry.member_id] || 0) + entry.amount;
        return acc;
      }, {} as Record<string, number>);

      // Get commitments for all members
      const memberIds = members.map(m => m.id);
      const { data: commitmentsData } = await supabase
        .from("member_commitments")
        .select("*")
        .in("member_id", memberIds);

      const commitmentsByMember = (commitmentsData || []).reduce((acc, c) => {
        if (!acc[c.member_id]) acc[c.member_id] = [];
        acc[c.member_id].push({
          id: c.id,
          name: c.name,
          metric: c.metric,
          ratio: c.ratio,
          donation_amount: c.donation_amount,
          personal_goal: c.personal_goal || 0,
          penalty_donation: c.penalty_donation || null,
        });
        return acc;
      }, {} as Record<string, MemberCommitment[]>);

      return members.map((member) => ({
        ...member,
        goals_reached: member.goals_reached || 0,
        total_contributed: contributionsByMember[member.id] || 0,
        commitments: commitmentsByMember[member.id] || [],
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
      queryClient.invalidateQueries({ queryKey: ["impactStats"] });
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
      queryClient.invalidateQueries({ queryKey: ["impactStats"] });
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

  // Remove member mutation (for leaders)
  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groupProgress", groupId] });
      queryClient.invalidateQueries({ queryKey: ["impactStats"] });
      toast({
        title: "Membro removido",
        description: "O membro foi removido do grupo.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover membro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Leave group mutation (for members)
  const leaveGroup = useMutation({
    mutationFn: async () => {
      if (!userMember) throw new Error("Você não é membro deste grupo");

      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("id", userMember.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] });
      queryClient.invalidateQueries({ queryKey: ["userGroups"] });
      queryClient.invalidateQueries({ queryKey: ["impactStats"] });
      toast({
        title: "Você saiu do grupo",
        description: "Você não é mais membro deste grupo.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao sair do grupo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update group mutation (for leaders)
  const updateGroup = useMutation({
    mutationFn: async (data: {
      donation_type: string;
      description: string | null;
      is_private: boolean;
      members_visible?: boolean;
      leader_name: string;
      leader_whatsapp: string;
      end_date: string;
      entity_id: string | null;
      image_url?: string | null;
      default_commitment_name?: string | null;
      default_commitment_metric?: string | null;
      default_commitment_ratio?: number;
      default_commitment_donation?: number;
      default_commitment_goal?: number;
    }) => {
      if (!groupId) throw new Error("Grupo não encontrado");

      const { error } = await supabase
        .from("groups")
        .update(data)
        .eq("id", groupId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast({
        title: "Grupo atualizado! ✅",
        description: "As alterações foram salvas com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar grupo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update member goal mutation
  const updateMemberGoal = useMutation({
    mutationFn: async ({ 
      memberId, 
      commitments,
    }: { 
      memberId: string; 
      commitments: Array<{ 
        id?: string; 
        name?: string;
        metric: string; 
        ratio: number; 
        donation_amount: number;
        personal_goal: number;
        penalty_donation?: number | null;
      }>;
    }) => {
      // Handle commitments - delete old ones and insert new ones
      // Delete existing commitments for this member
      const { error: deleteError } = await supabase
        .from("member_commitments")
        .delete()
        .eq("member_id", memberId);

      if (deleteError) throw deleteError;

      // Insert new commitments with all fields
      if (commitments.length > 0) {
        const newCommitments = commitments.map(c => ({
          member_id: memberId,
          name: c.name || `Meta de ${c.metric}`,
          metric: c.metric,
          ratio: c.ratio,
          donation_amount: c.donation_amount,
          personal_goal: c.personal_goal || 0,
          penalty_donation: c.penalty_donation || null,
        }));

        const { error: insertError } = await supabase
          .from("member_commitments")
          .insert(newCommitments);

        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] });
      toast({
        title: "Compromissos salvos! 🎯",
        description: "Suas metas de doação foram definidas com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar compromissos",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Calculate total group goal from members' commitments
  const totalGroupGoal = (members || []).reduce((sum, m) => {
    const memberTotal = (m.commitments || []).reduce((cSum, c) => cSum + (c.personal_goal || 0), 0);
    return sum + memberTotal;
  }, 0);

  // Check if user has full access to group details
  const hasFullAccess = group?.hasFullAccess ?? false;

  return {
    group,
    members,
    progressEntries,
    totalProgress,
    totalGroupGoal,
    userMember,
    hasFullAccess,
    isLoading: groupLoading || membersLoading || progressLoading,
    addProgress,
    deleteProgress,
    removeMember,
    leaveGroup,
    updateGroup,
    updateMemberGoal,
  };
};