-- Kiralama Sureci adimlarina musteri paneli bilgisi ekler (TR + EN).
-- Supabase > SQL Editor'de calistirin. Tekrar calistirmak guvenlidir (ayni metin iki kez eklenmez).

update public.blog_posts set
  content_tr = content_tr || $tr$

## Müşteri paneliniz
Rezervasyon onaylandığında size özel bir **müşteri paneli** açılır. Giriş kodunuz, onaydan sonra ekibimiz tarafından sizinle paylaşılır; e-posta adresiniz ve bu kodla giriş yaparsınız. Sözleşmenizi panelden görüntüleyebilir, indirebilir ve imzalayabilirsiniz.

[Müşteri girişi](/musteri)$tr$,
  content_en = case when content_en is null or content_en = '' then content_en else content_en || $en$

## Your customer panel
When your booking is confirmed, a private **customer panel** is opened for you. Our team shares your login code with you after confirmation; you log in with your e-mail address and this code. You can view, download and sign your contract in the panel.

[Customer login](/musteri)$en$ end
where slug = 'onay-sozlesme' and kind = 'process' and content_tr not like '%Müşteri paneliniz%';

update public.blog_posts set
  content_tr = content_tr || $tr$

Bu bilgilerin tamamlanma durumunu **müşteri panelinizdeki hazırlık listesinden** takip edebilirsiniz.$tr$,
  content_en = case when content_en is null or content_en = '' then content_en else content_en || $en$

You can follow how these items are coming along in the **preparation list in your customer panel**.$en$ end
where slug = 'detaylar-kumanya-listesi' and kind = 'process' and content_tr not like '%müşteri panelinizdeki%';

update public.blog_posts set
  content_tr = content_tr || $tr$

Yolculuğunuz için açıldığında, teknenin konumunu da **müşteri panelinizden** görebilirsiniz.$tr$,
  content_en = case when content_en is null or content_en = '' then content_en else content_en || $en$

When it is opened for your trip, you can also see the boat's location in your **customer panel**.$en$ end
where slug = 'seyir-gunleri' and kind = 'process' and content_tr not like '%müşteri panelinizden%';
