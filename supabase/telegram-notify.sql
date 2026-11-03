-- OPTIONAL: Telegram message to you when a new question arrives.
-- 1) Create a bot with @BotFather, copy its token. 2) Send any message to your bot.
-- 3) Open https://api.telegram.org/bot<TOKEN>/getUpdates in a browser and copy your chat id.
-- 4) Replace the two placeholders below and run this in the SQL Editor.
-- The token is stored only inside your database function (never in the website files).
-- Needs the pg_net extension: Dashboard -> Database -> Extensions -> enable "pg_net".

create or replace function public.notify_telegram() returns trigger
language plpgsql security definer set search_path = public, extensions as
$$
begin
  perform net.http_post(
    url := 'https://api.telegram.org/botPUT_BOT_TOKEN_HERE/sendMessage',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object(
      'chat_id', 'PUT_CHAT_ID_HERE',
      'text', 'Yangi savol keldi (' || new.exam || '): ' || left(coalesce(new.payload->>'text', ''), 200)
    )
  );
  return new;
exception when others then
  return new; -- never block a submission because of the notification
end
$$;

drop trigger if exists submissions_notify on public.submissions;
create trigger submissions_notify after insert on public.submissions
  for each row execute function public.notify_telegram();
