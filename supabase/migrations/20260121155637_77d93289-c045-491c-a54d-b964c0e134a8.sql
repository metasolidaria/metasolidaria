-- Criar tabela de entidades beneficiárias
CREATE TABLE public.entities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índice único para evitar duplicatas (mesmo nome na mesma cidade)
CREATE UNIQUE INDEX unique_entity_name_city ON entities (LOWER(name), LOWER(city));

-- Habilitar RLS
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa autenticada pode ver entidades
CREATE POLICY "Anyone authenticated can view entities"
ON entities FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Qualquer pessoa autenticada pode criar entidades
CREATE POLICY "Authenticated users can create entities"
ON entities FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Adicionar coluna entity_id na tabela groups (nullable para "ainda não definido")
ALTER TABLE groups ADD COLUMN entity_id UUID REFERENCES entities(id);