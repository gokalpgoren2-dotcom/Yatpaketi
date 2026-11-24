# Yatpaketi mobil uygulaması

Uygulama önce kendi açılış animasyonunu (www/index.html) oynatır, sonra siteyi (https://www.yatpaketi.com) açar; site güncellenince uygulama da güncellenir.
Mağazaya yeniden yüklemek yalnızca simge, ad, izinler ya da yerel özellikler değişince gerekir.

- Uygulama kimliği: `com.yatpaketi.app` (mağazaya ilk yüklemeden sonra değiştirilemez)
- Simge ve açılış ekranı kaynakları: `assets/`
- Derleme: GitHub › Actions › "Mobil uygulama" (bu klasör değişince kendiliğinden çalışır)
- Site, uygulama içinde açıldığını tarayıcı kimliğindeki `YatpaketiApp` ifadesinden anlar.
