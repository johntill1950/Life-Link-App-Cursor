-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade,
  username text unique,
  full_name text,
  emergency_contact text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- Create health_data table
create table health_data (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  heart_rate integer not null,
  oxygen_saturation integer not null,
  movement integer not null,
  latitude double precision,
  longitude double precision,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_settings table
create table user_settings (
  id uuid references auth.users on delete cascade primary key,
  notifications boolean default true,
  location_tracking boolean default true,
  dark_mode boolean default false,
  emergency_alerts boolean default true,
  data_sharing boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table health_data enable row level security;
alter table user_settings enable row level security;

-- Create policies
create policy "Users can view own profile"
  on profiles for select
  using ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

create policy "Users can view own health data"
  on health_data for select
  using ( auth.uid() = user_id );

create policy "Users can insert own health data"
  on health_data for insert
  with check ( auth.uid() = user_id );

create policy "Users can view own settings"
  on user_settings for select
  using ( auth.uid() = id );

create policy "Users can update own settings"
  on user_settings for update
  using ( auth.uid() = id );

-- Create function to handle new user signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name');
  
  insert into public.user_settings (id)
  values (new.id);
  
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 