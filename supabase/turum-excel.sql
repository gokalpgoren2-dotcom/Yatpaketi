-- TURUM: ALIŞVERİŞ LİSTESİ İÇİN EXCEL İZNİ. Supabase > SQL Editor'de bir kez çalıştırın.
update storage.buckets
set allowed_mime_types = array[
  'application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'
]
where id = 'portal-files';
