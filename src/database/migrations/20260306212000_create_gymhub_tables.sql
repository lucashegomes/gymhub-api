create extension if not exists pgcrypto;

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists teachers (
  id uuid primary key default gen_random_uuid(),
  name varchar(150) not null,
  cpf varchar(14) not null unique,
  email varchar(255) not null unique,
  phone varchar(20) not null,
  specialty varchar(120) not null,
  price_per_class numeric(10, 2) not null check (price_per_class >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  name varchar(150) not null,
  cpf varchar(14) not null unique,
  email varchar(255) not null unique,
  phone varchar(20) not null,
  birth_date date not null,
  plan_type varchar(50) not null,
  status varchar(20) not null check (status in ('active', 'inactive', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  name varchar(150) not null,
  teacher_id uuid not null references teachers(id) on update cascade on delete restrict,
  capacity integer not null check (capacity > 0),
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on update cascade on delete restrict,
  teacher_id uuid not null references teachers(id) on update cascade on delete restrict,
  date date not null,
  time time not null,
  capacity integer not null check (capacity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_classes_schedule unique (course_id, teacher_id, date, time)
);

create table if not exists checkins (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on update cascade on delete restrict,
  class_id uuid not null references classes(id) on update cascade on delete restrict,
  checkin_time timestamptz not null,
  source varchar(20) not null check (source in ('manual', 'wellhub')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_checkins_student_class unique (student_id, class_id)
);

create index if not exists idx_courses_teacher_id on courses (teacher_id);
create index if not exists idx_classes_course_id on classes (course_id);
create index if not exists idx_classes_teacher_id on classes (teacher_id);
create index if not exists idx_checkins_student_id on checkins (student_id);
create index if not exists idx_checkins_class_id on checkins (class_id);
create index if not exists idx_checkins_checkin_time on checkins (checkin_time);

create or replace function validate_class_capacity()
returns trigger as $$
declare
  course_capacity integer;
begin
  select capacity into course_capacity from courses where id = new.course_id;

  if course_capacity is null then
    raise exception 'course_id invalido: curso nao encontrado';
  end if;

  if new.capacity > course_capacity then
    raise exception 'capacity invalido: capacidade da aula maior que a do curso';
  end if;

  return new;
end;
$$ language plpgsql;

create or replace function validate_class_teacher_match()
returns trigger as $$
declare
  course_teacher_id uuid;
begin
  select teacher_id into course_teacher_id from courses where id = new.course_id;

  if course_teacher_id is null then
    raise exception 'course_id invalido: curso nao encontrado';
  end if;

  if new.teacher_id <> course_teacher_id then
    raise exception 'teacher_id invalido: professor diferente do curso selecionado';
  end if;

  return new;
end;
$$ language plpgsql;

create trigger trg_teachers_updated_at
before update on teachers
for each row execute function set_updated_at();

create trigger trg_students_updated_at
before update on students
for each row execute function set_updated_at();

create trigger trg_courses_updated_at
before update on courses
for each row execute function set_updated_at();

create trigger trg_classes_updated_at
before update on classes
for each row execute function set_updated_at();

create trigger trg_checkins_updated_at
before update on checkins
for each row execute function set_updated_at();

create trigger trg_validate_class_capacity
before insert or update on classes
for each row execute function validate_class_capacity();

create trigger trg_validate_class_teacher_match
before insert or update on classes
for each row execute function validate_class_teacher_match();
