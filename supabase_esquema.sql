-- RED SEGURA VES | MODULO COMUNIDAD | POSTGRESQL / SUPABASE
-- Ejecutar una sola vez en Supabase > SQL Editor, como administrador.
--
-- PRIVACIDAD:
-- * No almacena nombres, DNI, direcciones, sector, riesgo, instituciones recomendadas
--   ni narraciones de hechos de violencia.
-- * Cuenta solo contribuciones voluntarias por categoria y mes.
-- * Los conteos NO se publican en tiempo real: se publica cada mes CERRADO
--   si reúne al menos 20 aportaciones y ninguna categoria pequeña (1 a 4).
-- * Los comentarios quedan PENDIENTES hasta revisión humana.
-- * NO es un sistema de denuncias ni un expediente.
-- * Esta versión NO tiene controles efectivos de tasa en servidor; instalar medidas
--   antiabuso antes de lanzar públicamente. Los conteos no son hechos verificados.

begin;

create table if not exists public.rsv_conteos_internos (
    periodo date not null,
    categoria text not null check (categoria in ('psicologica', 'legal', 'proteccion')),
    cantidad bigint not null default 0 check (cantidad >= 0),
    primary key (periodo, categoria)
);

create table if not exists public.rsv_resumen_publicado (
    periodo date not null,
    categoria text not null check (categoria in ('psicologica', 'legal', 'proteccion')),
    cantidad bigint not null check (cantidad >= 0),
    primary key (periodo, categoria)
);

create table if not exists public.rsv_opiniones (
    id bigint generated always as identity primary key,
    calificacion smallint not null check (calificacion between 1 and 5),
    comentario_original text not null check (char_length(comentario_original) between 20 and 400),
    comentario_publicado text,
    estado text not null default 'pendiente'
        check (estado in ('pendiente', 'aprobada', 'rechazada')),
    creado_en timestamptz not null default now(),
    aprobado_en timestamptz,
    constraint rsv_publicacion_valida check (
        estado <> 'aprobada'
        or (comentario_publicado is not null and char_length(btrim(comentario_publicado)) between 10 and 400)
    )
);

create index if not exists rsv_opiniones_estado_idx
    on public.rsv_opiniones (estado, aprobado_en desc);

-- Ninguna tabla se consulta ni modifica directamente desde el navegador.
alter table public.rsv_conteos_internos enable row level security;
alter table public.rsv_resumen_publicado enable row level security;
alter table public.rsv_opiniones enable row level security;
revoke all on table public.rsv_conteos_internos from public, anon, authenticated;
revoke all on table public.rsv_resumen_publicado from public, anon, authenticated;
revoke all on table public.rsv_opiniones from public, anon, authenticated;

-- Inserta SOLO un conteo en el mes actual de Lima. Nunca recibe sector, riesgo o texto.
create or replace function public.rsv_registrar_consulta(p_categoria text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_periodo date;
begin
    if p_categoria is null or p_categoria not in ('psicologica','legal','proteccion') then
        raise exception 'Categoria no valida';
    end if;

    v_periodo := date_trunc('month', timezone('America/Lima', now()))::date;
    insert into public.rsv_conteos_internos (periodo, categoria, cantidad)
    values (v_periodo, p_categoria, 1)
    on conflict (periodo, categoria) do update
       set cantidad = public.rsv_conteos_internos.cantidad + 1;
    return true;
end;
$$;

-- Opiniones sobre la utilidad de LA WEB, nunca historias personales.
-- Se guardan en estado pendiente. No son visibles automáticamente.
create or replace function public.rsv_enviar_opinion(
    p_calificacion smallint,
    p_comentario text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_texto text;
begin
    v_texto := btrim(coalesce(p_comentario, ''));
    if p_calificacion is null or p_calificacion not between 1 and 5 then
        raise exception 'Calificacion no valida';
    end if;
    if char_length(v_texto) < 20 or char_length(v_texto) > 400 then
        raise exception 'El comentario debe tener entre 20 y 400 caracteres';
    end if;
    -- Filtro basico. NO reemplaza la moderacion humana.
    if v_texto ~* '(https?://|www\.|@|([0-9][[:space:].()-]*){7,})' then
        raise exception 'No incluyas enlaces, correos ni telefonos';
    end if;

    insert into public.rsv_opiniones (calificacion, comentario_original)
    values (p_calificacion, v_texto);
    return true;
end;
$$;

-- Solo devuelve conteos de los meses que el equipo YA APROBO publicar.
create or replace function public.rsv_resumen_por_tipo()
returns table (categoria text, cantidad bigint)
language sql
stable
security definer
set search_path = ''
as $$
    select c.categoria, coalesce(sum(s.cantidad), 0)::bigint as cantidad
      from (values ('psicologica'), ('legal'), ('proteccion')) as c(categoria)
      left join public.rsv_resumen_publicado s on s.categoria = c.categoria
     group by c.categoria
     order by case c.categoria when 'psicologica' then 1 when 'legal' then 2 else 3 end;
$$;

-- Historial PUBLICO, por MES y CATEGORIA, NO por persona.
create or replace function public.rsv_historial_mensual()
returns table (
    periodo date, psicologica bigint, legal bigint, proteccion bigint, total bigint
)
language sql
stable
security definer
set search_path = ''
as $$
    select s.periodo,
        coalesce(sum(s.cantidad) filter (where s.categoria = 'psicologica'),0)::bigint,
        coalesce(sum(s.cantidad) filter (where s.categoria = 'legal'),0)::bigint,
        coalesce(sum(s.cantidad) filter (where s.categoria = 'proteccion'),0)::bigint,
        sum(s.cantidad)::bigint
      from public.rsv_resumen_publicado s
     group by s.periodo
    having sum(s.cantidad) >= 20
     order by s.periodo desc
     limit 12;
$$;

-- Unicamente texto PUBLICADO/REVISADO; nunca texto original ni IDs.
create or replace function public.rsv_opiniones_aprobadas()
returns table (calificacion smallint, comentario text)
language sql
stable
security definer
set search_path = ''
as $$
    select o.calificacion, o.comentario_publicado
      from public.rsv_opiniones o
     where o.estado = 'aprobada'
       and o.comentario_publicado is not null
     order by o.aprobado_en desc nulls last
     limit 12;
$$;

-- SOLO ADMINISTRADOR (SQL Editor). Publicar únicamente meses cerrados.
-- Requiere >=20 aportaciones y ninguna categoria con 1 a 4 entradas.
create or replace function public.rsv_publicar_mes(p_periodo date)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_total bigint;
    v_pequenas integer;
begin
    if p_periodo is null
       or p_periodo <> date_trunc('month', p_periodo)::date
       or p_periodo >= date_trunc('month', timezone('America/Lima', now()))::date then
        raise exception 'Solo se permite publicar un mes anterior completo';
    end if;

    select coalesce(sum(cantidad), 0),
           count(*) filter (where cantidad between 1 and 4)
      into v_total, v_pequenas
      from public.rsv_conteos_internos
     where periodo = p_periodo;

    if v_total < 20 or v_pequenas > 0 then
        return false;
    end if;

    delete from public.rsv_resumen_publicado where periodo = p_periodo;
    insert into public.rsv_resumen_publicado (periodo, categoria, cantidad)
    select periodo, categoria, cantidad
      from public.rsv_conteos_internos
     where periodo = p_periodo;
    return true;
end;
$$;

-- Supabase concede EXECUTE por defecto; establecerlo expresamente.
revoke all on function public.rsv_registrar_consulta(text) from public, anon, authenticated;
revoke all on function public.rsv_enviar_opinion(smallint, text) from public, anon, authenticated;
revoke all on function public.rsv_resumen_por_tipo() from public, anon, authenticated;
revoke all on function public.rsv_historial_mensual() from public, anon, authenticated;
revoke all on function public.rsv_opiniones_aprobadas() from public, anon, authenticated;
revoke all on function public.rsv_publicar_mes(date) from public, anon, authenticated;

-- Endpoints anonimos estrictamente permitidos.
grant execute on function public.rsv_registrar_consulta(text) to anon;
grant execute on function public.rsv_enviar_opinion(smallint, text) to anon;
grant execute on function public.rsv_resumen_por_tipo() to anon;
grant execute on function public.rsv_historial_mensual() to anon;
grant execute on function public.rsv_opiniones_aprobadas() to anon;

-- NO conceder rsv_publicar_mes() a anon / authenticated.
commit;

-- Ejemplos PARA ADMINISTRADORES; no ejecutar sin revisar:
--
-- Ver comentarios pendientes:
-- select id, calificacion, comentario_original, creado_en
--   from public.rsv_opiniones where estado='pendiente' order by creado_en;
--
-- Aprobar tras eliminar cualquier detalle identificable del texto:
-- update public.rsv_opiniones
--    set comentario_publicado = 'Texto revisado y aprobado por el equipo',
--        estado='aprobada', aprobado_en=now()
--  where id = 123;
--
-- Rechazar:
-- update public.rsv_opiniones set estado='rechazada' where id=123;
--
-- Publicar mes CERRADO (después de revisar los conteos):
-- select public.rsv_publicar_mes(date '2026-10-01');
--
-- Borrar opiniones rechazadas o pendientes de más de 30 días:
-- delete from public.rsv_opiniones
--  where estado in ('rechazada','pendiente')
--    and creado_en < now() - interval '30 days';
