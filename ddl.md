create table members

(

&#x20;   id             uuid                  not null

&#x20;       primary key,

&#x20;   snowflake      text,

&#x20;   username       text                  not null,

&#x20;   minecraft\_id   uuid

&#x20;       unique

&#x20;                                        references public.players

&#x20;                                            on delete set null

&#x20;       constraint fk\_o2o\_minecraft\_id\_to\_id

&#x20;           references public.players

&#x20;           on update cascade on delete set null,

&#x20;   is\_member      boolean default false not null,

&#x20;   is\_boosting    boolean default false not null,

&#x20;   last\_link\_time timestamp with time zone

);



alter table members

&#x20;   owner to skyblock;



create table roles

(

&#x20;   id        uuid not null

&#x20;       primary key,

&#x20;   snowflake text not null

&#x20;       unique,

&#x20;   name      text not null

);



alter table roles

&#x20;   owner to skyblock;



create table user\_roles

(

&#x20;   members\_id uuid not null

&#x20;       constraint user\_roles\_user\_id\_fkey

&#x20;           references members

&#x20;       constraint fk\_pc\_m2m\_members\_id\_to\_id

&#x20;           references members

&#x20;           on update cascade on delete cascade,

&#x20;   roles\_id   uuid not null

&#x20;       constraint user\_roles\_role\_id\_fkey

&#x20;           references roles

&#x20;       constraint fk\_pc\_m2m\_roles\_id\_to\_id

&#x20;           references roles

&#x20;           on update cascade on delete cascade,

&#x20;   primary key (members\_id, roles\_id)

);



alter table user\_roles

&#x20;   owner to skyblock;



create table players

(

&#x20;   id                    uuid                     not null

&#x20;       primary key,

&#x20;   first\_joined          timestamp with time zone not null,

&#x20;   last\_known\_mc\_version text,

&#x20;   last\_seen             timestamp with time zone

);



alter table players

&#x20;   owner to skyblock;



create table staff\_rollbacks

(

&#x20;   id        uuid not null

&#x20;       primary key,

&#x20;   issuer\_id uuid not null

&#x20;       references players

&#x20;           deferrable initially deferred

&#x20;       constraint fk\_o2o\_issuer\_id\_to\_id

&#x20;           references players

&#x20;           on update cascade on delete set null,

&#x20;   target\_id uuid not null

&#x20;       references players

&#x20;           deferrable initially deferred

&#x20;       constraint fk\_o2o\_target\_id\_to\_id

&#x20;           references players

&#x20;           on update cascade on delete set null

);



alter table staff\_rollbacks

&#x20;   owner to skyblock;



create table punishments

(

&#x20;   id                uuid                     not null

&#x20;       primary key,

&#x20;   target\_id         uuid                     not null

&#x20;       references players

&#x20;           deferrable initially deferred

&#x20;       constraint fk\_o2o\_target\_id\_to\_id

&#x20;           references players

&#x20;           on update cascade on delete set null,

&#x20;   issuer\_id         uuid                     not null

&#x20;       references players

&#x20;           deferrable initially deferred

&#x20;       constraint fk\_o2o\_issuer\_id\_to\_id

&#x20;           references players

&#x20;           on update cascade on delete set null,

&#x20;   reason            text                     not null,

&#x20;   type              text                     not null,

&#x20;   issued\_at         timestamp with time zone not null,

&#x20;   duration          text                     not null,

&#x20;   revoked           boolean default false    not null,

&#x20;   revoked\_by\_id     uuid

&#x20;       references players

&#x20;           deferrable initially deferred

&#x20;       constraint fk\_o2o\_revoked\_by\_id\_to\_id

&#x20;           references players

&#x20;           on update cascade on delete set null,

&#x20;   revoked\_at        timestamp with time zone,

&#x20;   staff\_rollback\_id uuid

&#x20;       references staff\_rollbacks

&#x20;           deferrable initially deferred

&#x20;       constraint fk\_pc\_o2m\_staff\_rollback\_id\_to\_id

&#x20;           references staff\_rollbacks

&#x20;           on update cascade on delete set null

&#x20;       constraint fk\_o2o\_staff\_rollback\_id\_to\_id

&#x20;           references staff\_rollbacks

&#x20;           on update cascade on delete set null,

&#x20;   ip\_ban            boolean default false    not null,

&#x20;   ip\_address        text

);



alter table punishments

&#x20;   owner to skyblock;



create table whitelist

(

&#x20;   id     uuid    not null

&#x20;       primary key,

&#x20;   name   text    not null,

&#x20;   active boolean not null

);



alter table whitelist

&#x20;   owner to skyblock;



create table whitelist\_entries

(

&#x20;   player\_id   uuid    not null

&#x20;       primary key,

&#x20;   player\_name text    not null,

&#x20;   bedrock     boolean not null

);



alter table whitelist\_entries

&#x20;   owner to skyblock;



create table whitelist\_players

(

&#x20;   whitelist\_id                uuid not null

&#x20;       references whitelist

&#x20;           on delete cascade

&#x20;           deferrable initially deferred

&#x20;       constraint fk\_pc\_m2m\_whitelist\_id\_to\_id

&#x20;           references whitelist

&#x20;           on update cascade on delete cascade,

&#x20;   whitelist\_entries\_player\_id uuid not null

&#x20;       constraint whitelist\_players\_player\_id\_fkey

&#x20;           references whitelist\_entries

&#x20;           on delete cascade

&#x20;           deferrable initially deferred

&#x20;       constraint fk\_pc\_m2m\_whitelist\_entries\_player\_id\_to\_player\_id

&#x20;           references whitelist\_entries

&#x20;           on update cascade on delete cascade,

&#x20;   primary key (whitelist\_id, whitelist\_entries\_player\_id)

);



alter table whitelist\_players

&#x20;   owner to skyblock;



create table private\_messages

(

&#x20;   id           uuid                     default gen\_random\_uuid() not null

&#x20;       primary key,

&#x20;   sender\_id    uuid,

&#x20;   recipient\_id uuid,

&#x20;   content      text                                               not null,

&#x20;   timestamp    timestamp with time zone default CURRENT\_TIMESTAMP not null

);



alter table private\_messages

&#x20;   owner to skyblock;



create table whitelist\_servergroups

(

&#x20;   whitelist\_servergroups\_id uuid not null

&#x20;       primary key,

&#x20;   whitelist\_id              uuid not null

&#x20;       constraint fk\_pc\_o2mv\_whitelist\_id\_to\_id

&#x20;           references whitelist

&#x20;           on update cascade on delete cascade,

&#x20;   value                     text

);



alter table whitelist\_servergroups

&#x20;   owner to skyblock;



\-- Unknown how to generate base type type



alter type hstore owner to postgres;



\-- Unknown how to generate base type type



alter type ghstore owner to postgres;



create table players

(

&#x20;   id                 uuid                                                                                not null

&#x20;       primary key,

&#x20;   name               text                                                                                not null,

&#x20;   first\_ever\_joined  timestamp with time zone default CURRENT\_TIMESTAMP                                  not null,

&#x20;   vanished           boolean                  default false                                              not null,

&#x20;   last\_vote          timestamp with time zone default '1970-01-01 00:00:00+00'::timestamp with time zone not null,

&#x20;   vanished\_on\_join   boolean                  default false                                              not null,

&#x20;   current\_ip\_address text                                                                                not null,

&#x20;   unclaimed\_votes    integer                  default 0                                                  not null

);



alter table players

&#x20;   owner to skyblock;



create table gift\_card\_balances

(

&#x20;   player\_id uuid                         not null

&#x20;       primary key

&#x20;       references players,

&#x20;   balance   double precision default 0.0 not null

);



alter table gift\_card\_balances

&#x20;   owner to skyblock;



create table gift\_card\_holds

(

&#x20;   id         uuid                     default gen\_random\_uuid() not null

&#x20;       primary key,

&#x20;   player\_id  uuid                                               not null

&#x20;       references players,

&#x20;   amount     double precision                                   not null,

&#x20;   reason     text                                               not null,

&#x20;   created\_at timestamp with time zone default CURRENT\_TIMESTAMP not null

);



alter table gift\_card\_holds

&#x20;   owner to skyblock;



create table gift\_card\_modifications

(

&#x20;   id          uuid                     default gen\_random\_uuid() not null

&#x20;       primary key,

&#x20;   player\_id   uuid                                               not null

&#x20;       references players,

&#x20;   modifier\_id uuid                                               not null

&#x20;       references players,

&#x20;   amount      double precision                                   not null,

&#x20;   created\_at  timestamp with time zone default CURRENT\_TIMESTAMP not null

);



alter table gift\_card\_modifications

&#x20;   owner to skyblock;



create table gift\_card\_payments

(

&#x20;   id         uuid                     default gen\_random\_uuid() not null

&#x20;       primary key,

&#x20;   from\_id    uuid                                               not null

&#x20;       references players,

&#x20;   to\_id      uuid                                               not null

&#x20;       references players,

&#x20;   amount     double precision                                   not null,

&#x20;   reason     text                                               not null,

&#x20;   created\_at timestamp with time zone default CURRENT\_TIMESTAMP not null

);



alter table gift\_card\_payments

&#x20;   owner to skyblock;



create table gift\_cards

(

&#x20;   code           text             not null

&#x20;       primary key,

&#x20;   player\_id      uuid             not null

&#x20;       references players,

&#x20;   initial\_amount double precision not null

);



alter table gift\_cards

&#x20;   owner to skyblock;



create table gift\_card\_transactions

(

&#x20;   id             uuid                     default gen\_random\_uuid() not null

&#x20;       primary key,

&#x20;   gift\_card\_code text                                               not null

&#x20;       references gift\_cards,

&#x20;   action         text                                               not null,

&#x20;   created\_at     timestamp with time zone default CURRENT\_TIMESTAMP not null

);



alter table gift\_card\_transactions

&#x20;   owner to skyblock;



create table player\_ip\_addresses

(

&#x20;   id         uuid                                               not null

&#x20;       primary key,

&#x20;   player\_id  uuid                                               not null

&#x20;       references players

&#x20;           on delete cascade

&#x20;           deferrable initially deferred,

&#x20;   ip\_address text                                               not null,

&#x20;   log\_time   timestamp with time zone default CURRENT\_TIMESTAMP not null

);



alter table player\_ip\_addresses

&#x20;   owner to skyblock;



create index idx\_player\_ip\_addresses\_ip

&#x20;   on player\_ip\_addresses (ip\_address);



create table player\_name\_changes

(

&#x20;   id        uuid                     default gen\_random\_uuid() not null

&#x20;       primary key,

&#x20;   player\_id uuid                                               not null

&#x20;       references players

&#x20;           on delete cascade,

&#x20;   old\_name  text                                               not null,

&#x20;   new\_name  text                                               not null,

&#x20;   timestamp timestamp with time zone default CURRENT\_TIMESTAMP not null

);



alter table player\_name\_changes

&#x20;   owner to skyblock;



create table player\_votes

(

&#x20;   player\_votes\_id uuid not null

&#x20;       primary key,

&#x20;   player\_id       uuid not null

&#x20;       references players

&#x20;           on delete cascade

&#x20;           deferrable initially deferred

&#x20;       constraint fk\_pc\_o2mv\_player\_id\_to\_id

&#x20;           references players

&#x20;           on update cascade on delete set null,

&#x20;   timestamp       timestamp with time zone

);



alter table player\_votes

&#x20;   owner to skyblock;



create index idx\_public\_players\_name

&#x20;   on players (name);



create table purchases

(

&#x20;   id             uuid                     not null

&#x20;       primary key,

&#x20;   player\_id      uuid                     not null

&#x20;       references players

&#x20;           on delete cascade

&#x20;           deferrable initially deferred

&#x20;       constraint fk\_pc\_o2m\_player\_id\_to\_id

&#x20;           references players

&#x20;           on update cascade on delete set null,

&#x20;   transaction\_id text                     not null,

&#x20;   item           text                     not null,

&#x20;   data           text                     not null,

&#x20;   quantity       integer                  not null,

&#x20;   created\_at     timestamp with time zone not null,

&#x20;   handled\_at     timestamp with time zone not null

);



alter table purchases

&#x20;   owner to skyblock;



create table player\_ignored\_players

(

&#x20;   players\_id     uuid not null

&#x20;       constraint fk\_pc\_m2m\_players\_id\_to\_id

&#x20;           references players

&#x20;           on update cascade on delete cascade,

&#x20;   players\_ref\_id uuid not null

&#x20;       constraint fk\_pc\_m2m\_players\_ref\_id\_to\_id

&#x20;           references players

&#x20;           on update cascade on delete cascade,

&#x20;   primary key (players\_id, players\_ref\_id)

);



alter table player\_ignored\_players

&#x20;   owner to skyblock;



create table chat\_messages

(

&#x20;   id           uuid                     default gen\_random\_uuid() not null

&#x20;       primary key,

&#x20;   server\_group text                                               not null,

&#x20;   server\_name  text                                               not null,

&#x20;   sender\_id    uuid

&#x20;                                                                   references players

&#x20;                                                                       on delete set null,

&#x20;   content      text                                               not null,

&#x20;   timestamp    timestamp with time zone default CURRENT\_TIMESTAMP not null,

&#x20;   chatroom     text                                               not null,

&#x20;   channel\_id   text

);



alter table chat\_messages

&#x20;   owner to skyblock;



create table audit\_logs

(

&#x20;   log\_id            uuid                                               not null

&#x20;       primary key,

&#x20;   timestamp         timestamp with time zone default CURRENT\_TIMESTAMP not null,

&#x20;   session\_id        uuid,

&#x20;   application\_group varchar(255)                                       not null,

&#x20;   application\_id    varchar(255)                                       not null,

&#x20;   user\_id           varchar(255)                                       not null,

&#x20;   action\_id         varchar(255)                                       not null,

&#x20;   action\_data       jsonb

);



alter table audit\_logs

&#x20;   owner to skyblock;



create view chat\_log\_view

&#x20;           (id, type, sender\_id, sender\_name, recipient\_id, recipient\_name, content, timestamp, server\_group,

&#x20;            server\_name, chatroom, channel\_id)

as

SELECT cm.id,

&#x20;      'chat\_message'::text AS type,

&#x20;      cm.sender\_id,

&#x20;      p.name               AS sender\_name,

&#x20;      NULL::uuid           AS recipient\_id,

&#x20;      NULL::text           AS recipient\_name,

&#x20;      cm.content,

&#x20;      cm."timestamp",

&#x20;      cm.server\_group,

&#x20;      cm.server\_name,

&#x20;      cm.chatroom,

&#x20;      cm.channel\_id

FROM chat\_messages cm

&#x20;        JOIN players p ON p.id = cm.sender\_id

UNION ALL

SELECT pm.id,

&#x20;      'private\_message'::text AS type,

&#x20;      pm.sender\_id,

&#x20;      ps.name                 AS sender\_name,

&#x20;      pm.recipient\_id,

&#x20;      pr.name                 AS recipient\_name,

&#x20;      pm.content,

&#x20;      pm."timestamp",

&#x20;      NULL::text              AS server\_group,

&#x20;      NULL::text              AS server\_name,

&#x20;      NULL::text              AS chatroom,

&#x20;      NULL::text              AS channel\_id

FROM proxy.private\_messages pm

&#x20;        JOIN players ps ON ps.id = pm.sender\_id

&#x20;        JOIN players pr ON pr.id = pm.recipient\_id;



alter table chat\_log\_view

&#x20;   owner to skyblock;



create function hstore\_in(cstring) returns hstore

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function hstore\_in(cstring) owner to postgres;



create function hstore\_out(hstore) returns cstring

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function hstore\_out(hstore) owner to postgres;



create function hstore\_recv(internal) returns hstore

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function hstore\_recv(internal) owner to postgres;



create function hstore\_send(hstore) returns bytea

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function hstore\_send(hstore) owner to postgres;



create function hstore\_version\_diag(hstore) returns integer

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function hstore\_version\_diag(hstore) owner to postgres;



create function fetchval(hstore, text) returns text

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function fetchval(hstore, text) owner to postgres;



create function slice\_array(hstore, text\[]) returns text\[]

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function slice\_array(hstore, text\[]) owner to postgres;



create function slice(hstore, text\[]) returns hstore

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function slice(hstore, text\[]) owner to postgres;



create function isexists(hstore, text) returns boolean

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function isexists(hstore, text) owner to postgres;



create function exist(hstore, text) returns boolean

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function exist(hstore, text) owner to postgres;



create function exists\_any(hstore, text\[]) returns boolean

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function exists\_any(hstore, text\[]) owner to postgres;



create function exists\_all(hstore, text\[]) returns boolean

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function exists\_all(hstore, text\[]) owner to postgres;



create function isdefined(hstore, text) returns boolean

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function isdefined(hstore, text) owner to postgres;



create function defined(hstore, text) returns boolean

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function defined(hstore, text) owner to postgres;



create function delete(hstore, text) returns hstore

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function delete(hstore, text) owner to postgres;



create function delete(hstore, text\[]) returns hstore

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function delete(hstore, text\[]) owner to postgres;



create function delete(hstore, hstore) returns hstore

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function delete(hstore, hstore) owner to postgres;



create function hs\_concat(hstore, hstore) returns hstore

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function hs\_concat(hstore, hstore) owner to postgres;



create function hs\_contains(hstore, hstore) returns boolean

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function hs\_contains(hstore, hstore) owner to postgres;



create function hs\_contained(hstore, hstore) returns boolean

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function hs\_contained(hstore, hstore) owner to postgres;



create function tconvert(text, text) returns hstore

&#x20;   immutable

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function tconvert(text, text) owner to postgres;



create function hstore(text, text) returns hstore

&#x20;   immutable

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function hstore(text, text) owner to postgres;



create function hstore(text\[], text\[]) returns hstore

&#x20;   immutable

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function hstore(text\[], text\[]) owner to postgres;



create function hstore(text\[]) returns hstore

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function hstore(text\[]) owner to postgres;



create function hstore\_to\_json(hstore) returns json

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function hstore\_to\_json(hstore) owner to postgres;



create function hstore\_to\_json\_loose(hstore) returns json

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function hstore\_to\_json\_loose(hstore) owner to postgres;



create function hstore\_to\_jsonb(hstore) returns jsonb

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function hstore\_to\_jsonb(hstore) owner to postgres;



create function hstore\_to\_jsonb\_loose(hstore) returns jsonb

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function hstore\_to\_jsonb\_loose(hstore) owner to postgres;



create function hstore(record) returns hstore

&#x20;   immutable

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function hstore(record) owner to postgres;



create function hstore\_to\_array(hstore) returns text\[]

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function hstore\_to\_array(hstore) owner to postgres;



create function hstore\_to\_matrix(hstore) returns text\[]

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function hstore\_to\_matrix(hstore) owner to postgres;



create function akeys(hstore) returns text\[]

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function akeys(hstore) owner to postgres;



create function avals(hstore) returns text\[]

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function avals(hstore) owner to postgres;



create function skeys(hstore) returns setof text

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function skeys(hstore) owner to postgres;



create function svals(hstore) returns setof text

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function svals(hstore) owner to postgres;



create function each(hs hstore, out key text, out value text) returns setof record

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function each(hstore, out text, out text) owner to postgres;



create function populate\_record(anyelement, hstore) returns anyelement

&#x20;   immutable

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function populate\_record(anyelement, hstore) owner to postgres;



create function hstore\_eq(hstore, hstore) returns boolean

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function hstore\_eq(hstore, hstore) owner to postgres;



create function hstore\_ne(hstore, hstore) returns boolean

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function hstore\_ne(hstore, hstore) owner to postgres;



create function hstore\_gt(hstore, hstore) returns boolean

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function hstore\_gt(hstore, hstore) owner to postgres;



create function hstore\_ge(hstore, hstore) returns boolean

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function hstore\_ge(hstore, hstore) owner to postgres;



create function hstore\_lt(hstore, hstore) returns boolean

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function hstore\_lt(hstore, hstore) owner to postgres;



create function hstore\_le(hstore, hstore) returns boolean

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function hstore\_le(hstore, hstore) owner to postgres;



create function hstore\_cmp(hstore, hstore) returns integer

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function hstore\_cmp(hstore, hstore) owner to postgres;



create function hstore\_hash(hstore) returns integer

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function hstore\_hash(hstore) owner to postgres;



create function ghstore\_in(cstring) returns ghstore

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function ghstore\_in(cstring) owner to postgres;



create function ghstore\_out(ghstore) returns cstring

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function ghstore\_out(ghstore) owner to postgres;



create function ghstore\_compress(internal) returns internal

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function ghstore\_compress(internal) owner to postgres;



create function ghstore\_decompress(internal) returns internal

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function ghstore\_decompress(internal) owner to postgres;



create function ghstore\_penalty(internal, internal, internal) returns internal

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function ghstore\_penalty(internal, internal, internal) owner to postgres;



create function ghstore\_picksplit(internal, internal) returns internal

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function ghstore\_picksplit(internal, internal) owner to postgres;



create function ghstore\_union(internal, internal) returns ghstore

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function ghstore\_union(internal, internal) owner to postgres;



create function ghstore\_same(ghstore, ghstore, internal) returns internal

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function ghstore\_same(ghstore, ghstore, internal) owner to postgres;



create function ghstore\_consistent(internal, hstore, smallint, oid, internal) returns boolean

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function ghstore\_consistent(internal, hstore, smallint, oid, internal) owner to postgres;



create function gin\_extract\_hstore(hstore, internal) returns internal

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function gin\_extract\_hstore(hstore, internal) owner to postgres;



create function gin\_extract\_hstore\_query(hstore, internal, smallint, internal, internal) returns internal

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function gin\_extract\_hstore\_query(hstore, internal, smallint, internal, internal) owner to postgres;



create function gin\_consistent\_hstore(internal, smallint, hstore, integer, internal, internal) returns boolean

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function gin\_consistent\_hstore(internal, smallint, hstore, integer, internal, internal) owner to postgres;



create function hstore\_hash\_extended(hstore, bigint) returns bigint

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function hstore\_hash\_extended(hstore, bigint) owner to postgres;



create function ghstore\_options(internal) returns void

&#x20;   immutable

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function ghstore\_options(internal) owner to postgres;



create function hstore\_subscript\_handler(internal) returns internal

&#x20;   immutable

&#x20;   strict

&#x20;   parallel safe

&#x20;   language c

as

$$

begin

\-- missing source code

end;

$$;



alter function hstore\_subscript\_handler(internal) owner to postgres;



create operator -> (procedure = fetchval, leftarg = hstore, rightarg = text);



alter operator ->(hstore, text) owner to postgres;



create operator -> (procedure = slice\_array, leftarg = hstore, rightarg = text\[]);



alter operator ->(hstore, text\[]) owner to postgres;



create operator ? (procedure = exist, leftarg = hstore, rightarg = text, join = pg\_catalog.matchingjoinsel, restrict = pg\_catalog.matchingsel);



alter operator ?(hstore, text) owner to postgres;



create operator ?| (procedure = exists\_any, leftarg = hstore, rightarg = text\[], join = pg\_catalog.matchingjoinsel, restrict = pg\_catalog.matchingsel);



alter operator ?|(hstore, text\[]) owner to postgres;



create operator ?\& (procedure = exists\_all, leftarg = hstore, rightarg = text\[], join = pg\_catalog.matchingjoinsel, restrict = pg\_catalog.matchingsel);



alter operator ?\&(hstore, text\[]) owner to postgres;



create operator - (procedure = delete, leftarg = hstore, rightarg = text);



alter operator -(hstore, text) owner to postgres;



create operator - (procedure = delete, leftarg = hstore, rightarg = text\[]);



alter operator -(hstore, text\[]) owner to postgres;



create operator - (procedure = delete, leftarg = hstore, rightarg = hstore);



alter operator -(hstore, hstore) owner to postgres;



create operator || (procedure = hs\_concat, leftarg = hstore, rightarg = hstore);



alter operator ||(hstore, hstore) owner to postgres;



create operator %% (procedure = hstore\_to\_array, rightarg = hstore);



alter operator %%(none, hstore) owner to postgres;



create operator %# (procedure = hstore\_to\_matrix, rightarg = hstore);



alter operator %#(none, hstore) owner to postgres;



create operator #= (procedure = populate\_record, leftarg = anyelement, rightarg = hstore);



alter operator #=(anyelement, hstore) owner to postgres;



create operator family btree\_hstore\_ops using btree;



alter operator family btree\_hstore\_ops using btree add

&#x20;   operator 4 #>=#(hstore, hstore),

&#x20;   operator 3 =(hstore, hstore),

&#x20;   operator 5 #>#(hstore, hstore),

&#x20;   operator 1 #<#(hstore, hstore),

&#x20;   operator 2 #<=#(hstore, hstore),

&#x20;   function 1(hstore, hstore) hstore\_cmp(hstore, hstore);



alter operator family btree\_hstore\_ops using btree owner to postgres;



create operator class btree\_hstore\_ops default for type hstore using btree as

&#x20;   operator 3 =(hstore, hstore),

&#x20;   operator 1 #<#(hstore, hstore),

&#x20;   operator 5 #>#(hstore, hstore),

&#x20;   operator 2 #<=#(hstore, hstore),

&#x20;   operator 4 #>=#(hstore, hstore),

&#x20;   function 1(hstore, hstore) hstore\_cmp(hstore, hstore);



alter operator class btree\_hstore\_ops using btree owner to postgres;



create operator family hash\_hstore\_ops using hash;



alter operator family hash\_hstore\_ops using hash add

&#x20;   operator 1 =(hstore, hstore),

&#x20;   function 2(hstore, hstore) hstore\_hash\_extended(hstore, bigint),

&#x20;   function 1(hstore, hstore) hstore\_hash(hstore);



alter operator family hash\_hstore\_ops using hash owner to postgres;



create operator class hash\_hstore\_ops default for type hstore using hash as

&#x20;   operator 1 =(hstore, hstore),

&#x20;   function 1(hstore, hstore) hstore\_hash(hstore);



alter operator class hash\_hstore\_ops using hash owner to postgres;



create operator family gist\_hstore\_ops using gist;



alter operator family gist\_hstore\_ops using gist add

&#x20;   operator 9 ?(hstore, text),

&#x20;   operator 7 @>(hstore, hstore),

&#x20;   operator 10 ?|(hstore, text\[]),

&#x20;   operator 11 ?\&(hstore, text\[]),

&#x20;   function 10(hstore, hstore) ghstore\_options(internal),

&#x20;   function 1(hstore, hstore) ghstore\_consistent(internal, hstore, smallint, oid, internal),

&#x20;   function 2(hstore, hstore) ghstore\_union(internal, internal),

&#x20;   function 3(hstore, hstore) ghstore\_compress(internal),

&#x20;   function 4(hstore, hstore) ghstore\_decompress(internal),

&#x20;   function 5(hstore, hstore) ghstore\_penalty(internal, internal, internal),

&#x20;   function 6(hstore, hstore) ghstore\_picksplit(internal, internal),

&#x20;   function 7(hstore, hstore) ghstore\_same(ghstore, ghstore, internal);



alter operator family gist\_hstore\_ops using gist owner to postgres;



create operator class gist\_hstore\_ops default for type hstore using gist as storage ghstore function 7(hstore, hstore) ghstore\_same(ghstore, ghstore, internal),

&#x09;function 5(hstore, hstore) ghstore\_penalty(internal, internal, internal),

&#x09;function 6(hstore, hstore) ghstore\_picksplit(internal, internal),

&#x09;function 1(hstore, hstore) ghstore\_consistent(internal, hstore, smallint, oid, internal),

&#x09;function 2(hstore, hstore) ghstore\_union(internal, internal);



alter operator class gist\_hstore\_ops using gist owner to postgres;



create operator family gin\_hstore\_ops using gin;



alter operator family gin\_hstore\_ops using gin add

&#x20;   operator 7 @>(hstore, hstore),

&#x20;   operator 9 ?(hstore, text),

&#x20;   operator 10 ?|(hstore, text\[]),

&#x20;   operator 11 ?\&(hstore, text\[]),

&#x20;   function 4(hstore, hstore) gin\_consistent\_hstore(internal, smallint, hstore, integer, internal, internal),

&#x20;   function 3(hstore, hstore) gin\_extract\_hstore\_query(hstore, internal, smallint, internal, internal),

&#x20;   function 2(hstore, hstore) gin\_extract\_hstore(hstore, internal),

&#x20;   function 1(hstore, hstore) pg\_catalog.bttextcmp(unknown, unknown);



alter operator family gin\_hstore\_ops using gin owner to postgres;



create operator class gin\_hstore\_ops default for type hstore using gin as storage text function 2(hstore, hstore) gin\_extract\_hstore(hstore, internal),

&#x09;function 3(hstore, hstore) gin\_extract\_hstore\_query(hstore, internal, smallint, internal, internal);



alter operator class gin\_hstore\_ops using gin owner to postgres;



\-- Cyclic dependencies found



create operator <> (procedure = hstore\_ne, leftarg = hstore, rightarg = hstore, commutator = <>, negator = =, join = pg\_catalog.neqjoinsel, restrict = pg\_catalog.neqsel);



alter operator <>(hstore, hstore) owner to postgres;



create operator = (procedure = hstore\_eq, leftarg = hstore, rightarg = hstore, commutator = =, negator = <>, join = pg\_catalog.eqjoinsel, restrict = pg\_catalog.eqsel, hashes, merges);



alter operator =(hstore, hstore) owner to postgres;



\-- Cyclic dependencies found



create operator <@ (procedure = hs\_contained, leftarg = hstore, rightarg = hstore, commutator = @>, join = pg\_catalog.matchingjoinsel, restrict = pg\_catalog.matchingsel);



alter operator <@(hstore, hstore) owner to postgres;



create operator @> (procedure = hs\_contains, leftarg = hstore, rightarg = hstore, commutator = <@, join = pg\_catalog.matchingjoinsel, restrict = pg\_catalog.matchingsel);



alter operator @>(hstore, hstore) owner to postgres;



\-- Cyclic dependencies found



create operator #<# (procedure = hstore\_lt, leftarg = hstore, rightarg = hstore, commutator = #>#, negator = #>=#, join = pg\_catalog.scalarltjoinsel, restrict = pg\_catalog.scalarltsel);



alter operator #<#(hstore, hstore) owner to postgres;



\-- Cyclic dependencies found



create operator #># (procedure = hstore\_gt, leftarg = hstore, rightarg = hstore, commutator = #<#, negator = #<=#, join = pg\_catalog.scalargtjoinsel, restrict = pg\_catalog.scalargtsel);



alter operator #>#(hstore, hstore) owner to postgres;



\-- Cyclic dependencies found



create operator #<=# (procedure = hstore\_le, leftarg = hstore, rightarg = hstore, commutator = #>=#, negator = #>#, join = pg\_catalog.scalarlejoinsel, restrict = pg\_catalog.scalarlesel);



alter operator #<=#(hstore, hstore) owner to postgres;



create operator #>=# (procedure = hstore\_ge, leftarg = hstore, rightarg = hstore, commutator = #<=#, negator = #<#, join = pg\_catalog.scalargejoinsel, restrict = pg\_catalog.scalargesel);



alter operator #>=#(hstore, hstore) owner to postgres;





