create table if not exists roles (
  id uuid primary key default gen_random_uuid(),
  name varchar(80) not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists permissions (
  id uuid primary key default gen_random_uuid(),
  resource varchar(80) not null,
  action varchar(20) not null check (action in ('create', 'read', 'update', 'delete', 'view')),
  screen varchar(120) not null,
  created_at timestamptz not null default now(),
  unique(resource, action, screen)
);

create table if not exists feature_flags (
  id uuid primary key default gen_random_uuid(),
  key varchar(80) not null unique,
  enabled boolean not null default true,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists role_permissions (
  role_id uuid not null references roles(id) on delete cascade,
  permission_id uuid not null references permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create table if not exists role_feature_flags (
  role_id uuid not null references roles(id) on delete cascade,
  feature_flag_id uuid not null references feature_flags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, feature_flag_id)
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name varchar(150) not null,
  email varchar(255) not null unique,
  cpf varchar(14) not null unique,
  password_hash text not null,
  photo_url text,
  role_id uuid not null references roles(id) on update cascade on delete restrict,
  status varchar(20) not null check (status in ('active', 'inactive', 'blocked')) default 'active',
  last_login timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  action varchar(80) not null,
  resource varchar(80),
  entity_id uuid,
  description text,
  ip varchar(80),
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists menus (
  id uuid primary key default gen_random_uuid(),
  key varchar(80) not null unique,
  label varchar(80) not null,
  path varchar(255) not null,
  screen varchar(120) not null,
  resource varchar(80) not null,
  action varchar(20) not null,
  icon varchar(80),
  sort_order integer not null default 0,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_logs_user_id on logs(user_id);
create index if not exists idx_logs_created_at on logs(created_at desc);
create index if not exists idx_users_role_id on users(role_id);
create index if not exists idx_users_status on users(status);
create index if not exists idx_password_reset_tokens_user_id on password_reset_tokens(user_id);

insert into roles(name, description)
values
  ('admin', 'Acesso total ao sistema'),
  ('manager', 'Gestao operacional'),
  ('reception', 'Atendimento e recepcao'),
  ('teacher', 'Professor')
on conflict (name) do nothing;

insert into feature_flags(key, enabled, description)
values
  ('advanced_reports', true, 'Relatorios avancados'),
  ('wellhub_integration', true, 'Integracao Wellhub'),
  ('student_app', false, 'Aplicativo do aluno')
on conflict (key) do nothing;

insert into permissions(resource, action, screen)
values
  ('dashboard', 'view', 'dashboard'),
  ('students', 'read', 'students.page'),
  ('students', 'create', 'students.form'),
  ('students', 'update', 'students.form'),
  ('students', 'delete', 'students.page'),
  ('teachers', 'read', 'teachers.page'),
  ('teachers', 'create', 'teachers.form'),
  ('teachers', 'update', 'teachers.form'),
  ('teachers', 'delete', 'teachers.page'),
  ('courses', 'read', 'courses.page'),
  ('courses', 'create', 'courses.form'),
  ('courses', 'update', 'courses.form'),
  ('courses', 'delete', 'courses.page'),
  ('classes', 'read', 'classes.page'),
  ('classes', 'create', 'classes.form'),
  ('classes', 'update', 'classes.form'),
  ('classes', 'delete', 'classes.page'),
  ('checkins', 'read', 'checkins.page'),
  ('checkins', 'create', 'checkins.form'),
  ('checkins', 'update', 'checkins.form'),
  ('checkins', 'delete', 'checkins.page'),
  ('users', 'read', 'users.page'),
  ('users', 'create', 'users.form'),
  ('users', 'update', 'users.form'),
  ('users', 'delete', 'users.page'),
  ('roles', 'read', 'roles.page'),
  ('roles', 'create', 'roles.form'),
  ('roles', 'update', 'roles.form'),
  ('roles', 'delete', 'roles.page'),
  ('permissions', 'read', 'permissions.page'),
  ('permissions', 'create', 'permissions.form'),
  ('permissions', 'update', 'permissions.form'),
  ('permissions', 'delete', 'permissions.page'),
  ('feature_flags', 'read', 'feature-flags.page'),
  ('feature_flags', 'create', 'feature-flags.form'),
  ('feature_flags', 'update', 'feature-flags.form'),
  ('feature_flags', 'delete', 'feature-flags.page'),
  ('logs', 'read', 'logs.page'),
  ('menus', 'read', 'menus.page'),
  ('menus', 'create', 'menus.form'),
  ('menus', 'update', 'menus.form'),
  ('menus', 'delete', 'menus.page')
on conflict (resource, action, screen) do nothing;

insert into role_permissions(role_id, permission_id)
select r.id, p.id
from roles r
cross join permissions p
where r.name = 'admin'
on conflict do nothing;

insert into role_feature_flags(role_id, feature_flag_id)
select r.id, f.id
from roles r
join feature_flags f on f.enabled = true
where r.name in ('admin', 'manager')
on conflict do nothing;

insert into role_permissions(role_id, permission_id)
select r.id, p.id
from roles r
join permissions p on p.resource in ('dashboard','students','teachers','courses','classes','checkins')
where r.name = 'manager'
on conflict do nothing;

insert into role_permissions(role_id, permission_id)
select r.id, p.id
from roles r
join permissions p on p.resource in ('dashboard','students','checkins')
where r.name = 'reception'
on conflict do nothing;

insert into role_permissions(role_id, permission_id)
select r.id, p.id
from roles r
join permissions p on p.resource in ('dashboard','classes','checkins')
where r.name = 'teacher'
on conflict do nothing;

insert into menus(key,label,path,screen,resource,action,icon,sort_order,enabled)
values
  ('dashboard','Dashboard','/','dashboard','dashboard','view','LayoutDashboard',1,true),
  ('students','Alunos','/students','students.page','students','read','Users',2,true),
  ('teachers','Professores','/teachers','teachers.page','teachers','read','GraduationCap',3,true),
  ('courses','Cursos','/courses','courses.page','courses','read','BookOpen',4,true),
  ('classes','Aulas','/classes','classes.page','classes','read','Calendar',5,true),
  ('checkins','Check-ins','/checkins','checkins.page','checkins','read','ClipboardCheck',6,true),
  ('users','Usuarios','/users','users.page','users','read','Shield',7,true)
on conflict (key) do nothing;
