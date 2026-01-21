-- Criar tabela para múltiplos compromissos de doação por membro
CREATE TABLE public.member_commitments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.group_members(id) ON DELETE CASCADE,
  metric TEXT NOT NULL, -- Ex: "gol", "assistência", "km corrido"
  ratio INTEGER NOT NULL DEFAULT 1, -- Ex: a cada 1 (gol)
  donation_amount INTEGER NOT NULL DEFAULT 1, -- doarei X kg
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.member_commitments ENABLE ROW LEVEL SECURITY;

-- Membros podem ver compromissos de grupos acessíveis
CREATE POLICY "Users can view commitments for accessible groups"
ON public.member_commitments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM group_members gm
    JOIN groups g ON g.id = gm.group_id
    WHERE gm.id = member_commitments.member_id
    AND (
      g.is_private = false
      OR g.leader_id = auth.uid()
      OR is_group_member(auth.uid(), g.id)
    )
  )
);

-- Membros podem criar seus próprios compromissos
CREATE POLICY "Users can create their own commitments"
ON public.member_commitments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.id = member_commitments.member_id
    AND gm.user_id = auth.uid()
  )
);

-- Membros podem atualizar seus próprios compromissos
CREATE POLICY "Users can update their own commitments"
ON public.member_commitments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.id = member_commitments.member_id
    AND gm.user_id = auth.uid()
  )
);

-- Membros podem deletar seus próprios compromissos
CREATE POLICY "Users can delete their own commitments"
ON public.member_commitments
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.id = member_commitments.member_id
    AND gm.user_id = auth.uid()
  )
);