-- Kiralama Sureci adimlarina "Rezervasyon takibi" bilgisi ekler (TR + EN).
-- Supabase > SQL Editor'de calistirin. Tekrar calistirmak guvenlidir; eski "musteri paneli" metni varsa once temizlenir.

-- 1) Daha once eklenen eski metinleri temizle
update public.blog_posts set
  content_tr = split_part(content_tr, E'\n\n## Müşteri paneliniz', 1),
  content_en = split_part(content_en, E'\n\n## Your customer panel', 1)
where slug = 'onay-sozlesme' and kind = 'process';
update public.blog_posts set
  content_tr = split_part(content_tr, E'\n\nBu bilgilerin tamamlanma durumunu', 1),
  content_en = split_part(content_en, E'\n\nYou can follow how these items', 1)
where slug = 'detaylar-kumanya-listesi' and kind = 'process';
update public.blog_posts set
  content_tr = split_part(content_tr, E'\n\nYolculuğunuz için açıldığında, teknenin konumunu', 1),
  content_en = split_part(content_en, E'\n\nWhen it is opened for your trip', 1)
where slug = 'seyir-gunleri' and kind = 'process';

-- 2) Yeni metinleri ekle
update public.blog_posts set
  content_tr = content_tr || $tr$

## Rezervasyon takibiniz
Rezervasyon onaylandığında size özel bir **rezervasyon takip sayfası** açılır. Giriş kodunuz, onaydan sonra ekibimiz tarafından sizinle paylaşılır; sitenin sağ üstündeki **Rezervasyon Takibi** düğmesinden e-posta adresiniz ve bu kodla giriş yaparsınız. Sözleşmenizi buradan görüntüleyebilir, indirebilir ve imzalayabilirsiniz.

[Rezervasyon Takibi](/musteri)$tr$,
  content_en = case when content_en is null or content_en = '' then content_en else content_en || $en$

## Your booking tracker
When your booking is confirmed, a private **booking tracker** page is opened for you. Our team shares your login code with you after confirmation; you log in with your e-mail address and this code using the **Booking Tracker** button at the top right of the site. You can view, download and sign your contract there.

[Booking Tracker](/musteri)$en$ end
where slug = 'onay-sozlesme' and kind = 'process' and content_tr not like '%Rezervasyon takibiniz%';

update public.blog_posts set
  content_tr = content_tr || $tr$

Bu bilgilerin tamamlanma durumunu **rezervasyon takip sayfanızdaki hazırlık listesinden** izleyebilirsiniz.$tr$,
  content_en = case when content_en is null or content_en = '' then content_en else content_en || $en$

You can follow how these items are coming along in the **preparation list on your booking tracker**.$en$ end
where slug = 'detaylar-kumanya-listesi' and kind = 'process' and content_tr not like '%rezervasyon takip sayfanızdaki%';

update public.blog_posts set
  content_tr = content_tr || $tr$

Yolculuğunuz için açıldığında, teknenin konumunu da **rezervasyon takip sayfanızdan** görebilirsiniz.$tr$,
  content_en = case when content_en is null or content_en = '' then content_en else content_en || $en$

When it is opened for your trip, you can also see the boat's location on your **booking tracker**.$en$ end
where slug = 'seyir-gunleri' and kind = 'process' and content_tr not like '%rezervasyon takip sayfanızdan%';
