CREATE SEQUENCE public.tasks_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;

CREATE TABLE public.tasks
(
  id integer NOT NULL DEFAULT nextval('tasks_id_seq'::regclass),
  title character varying(100) NOT NULL,
  created_on timestamp with time zone NOT NULL,
  CONSTRAINT pk_tasks PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);