-- Yönetici yapmak için: önce Supabase > Authentication > Users bölümünden bu e-posta ile bir kullanıcı oluşturun,
-- sonra aşağıdaki satırdaki e-postayı kendi e-postanızla değiştirip SQL Editor'de çalıştırın.
insert into public.admins (user_id)
select id from auth.users where email = 'BURAYA_KENDI_EPOSTANIZI_YAZIN'
on conflict do nothing;
