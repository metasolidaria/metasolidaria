-- Adicionar constraint UNIQUE para prevenir membros duplicados no mesmo grupo
ALTER TABLE group_members 
ADD CONSTRAINT unique_user_per_group UNIQUE (group_id, user_id)