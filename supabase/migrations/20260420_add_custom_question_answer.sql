alter table public.entries
  add column if not exists custom_question text,
  add column if not exists custom_answer text;

alter table public.entries
  alter column question drop not null,
  alter column fact drop not null,
  alter column answer drop not null;
