alter table students
  add column if not exists integration_id varchar(120);

create index if not exists idx_students_integration_id on students (integration_id);

create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  name varchar(120) not null unique,
  price numeric(10,2) not null check (price >= 0),
  periodicity varchar(20) not null check (periodicity in ('monthly', 'semiannual', 'annual')),
  monthly_checkin_limit integer not null check (monthly_checkin_limit > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists students_plans (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on update cascade on delete cascade,
  plan_id uuid not null references plans(id) on update cascade on delete restrict,
  start_date date not null,
  end_date date,
  status varchar(20) not null check (status in ('active', 'inactive', 'expired')),
  created_at timestamptz not null default now(),
  constraint uq_students_plans_period unique (student_id, plan_id, start_date)
);

create index if not exists idx_students_plans_student_id on students_plans (student_id);
create index if not exists idx_students_plans_status on students_plans (status);

create table if not exists student_guardians (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on update cascade on delete cascade,
  guardian_student_id uuid not null references students(id) on update cascade on delete restrict,
  relationship varchar(40) not null,
  created_at timestamptz not null default now(),
  constraint ck_student_guardians_self check (student_id <> guardian_student_id),
  constraint uq_student_guardian unique (student_id, guardian_student_id)
);

create index if not exists idx_student_guardians_student_id on student_guardians (student_id);
create index if not exists idx_student_guardians_guardian_student_id on student_guardians (guardian_student_id);

alter table courses
  alter column teacher_id drop not null;

create table if not exists course_teachers (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on update cascade on delete cascade,
  teacher_id uuid not null references teachers(id) on update cascade on delete restrict,
  created_at timestamptz not null default now(),
  constraint uq_course_teacher unique (course_id, teacher_id)
);

create index if not exists idx_course_teachers_course_id on course_teachers (course_id);
create index if not exists idx_course_teachers_teacher_id on course_teachers (teacher_id);

alter table classes
  add column if not exists name varchar(120);

update classes c
set name = coalesce(c.name, courses.name)
from courses
where courses.id = c.course_id;

alter table classes
  alter column name set not null;

drop trigger if exists trg_validate_class_teacher_match on classes;
drop function if exists validate_class_teacher_match();

create table if not exists class_schedules (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on update cascade on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  constraint ck_class_schedules_range check (start_time < end_time),
  constraint uq_class_schedule unique (class_id, weekday, start_time, end_time)
);

create index if not exists idx_class_schedules_class_id on class_schedules (class_id);
create index if not exists idx_class_schedules_weekday on class_schedules (weekday);

alter table checkins
  drop constraint if exists uq_checkins_student_class;

create index if not exists idx_checkins_student_time on checkins (student_id, checkin_time);

create trigger trg_plans_updated_at
before update on plans
for each row execute function set_updated_at();

insert into permissions (resource, action, screen)
values
  ('plans', 'read', 'plans.page'),
  ('plans', 'create', 'plans.form'),
  ('plans', 'update', 'plans.form'),
  ('plans', 'delete', 'plans.page')
on conflict (resource, action, screen) do nothing;

insert into role_permissions (role_id, permission_id)
select r.id, p.id
from roles r
join permissions p on p.resource = 'plans'
where r.name = 'admin'
on conflict do nothing;

insert into menus (key, label, path, screen, resource, action, icon, sort_order, enabled)
values ('plans', 'Planos', '/plans', 'plans.page', 'plans', 'read', 'Wallet', 7, true)
on conflict (key) do nothing;
