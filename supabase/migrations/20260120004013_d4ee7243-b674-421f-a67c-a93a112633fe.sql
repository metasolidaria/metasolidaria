-- Add leader_name, leader_whatsapp and description to groups table
ALTER TABLE public.groups 
ADD COLUMN leader_name text,
ADD COLUMN leader_whatsapp text,
ADD COLUMN description text;