// Klasik rotaların ek bilgileri (kalkış/varış, günlük durak adları). Gün açıklamaları panelde yazılan metinden okunur.
import type { Post } from "./posts";
import { href, type Lang } from "./i18n";

// days: panelde yazılan gün metinleri yerine kullanılacak gün gün program (Türkçe ve İngilizce).
type Meta = { from: string; to: string; port: string; stops: string[]; greek?: boolean; days?: { tr: string[]; en: string[] } };

const META: Record<string, Meta> = {
  "gocek-korfezi-12-adalar": {
    from: "Göcek", to: "Göcek", port: "gocek",
    stops: ["Göcek", "Yassıcalar / Zeytin Adası", "Akvaryum Koyu", "Binlik Koyu", "Hamam Koyu", "Bedri Rahmi", "Boynuzbükü"],
    days: {
      tr: [
        "Göcek'te karşılama, kabinlere yerleşme ve kumanya; ilk akşam sakin bir koyda.",
        "Birbirine yakın adacıklar arasında sığ, turkuaz sularda yüzme ve şnorkel molaları.",
        "Adını berrak suyundan alan koyda, dipteki kumu ve balıkları görebileceğiniz bir yüzme günü.",
        "Çamlarla çevrili sakin bir koyda dinlenme ve uzun bir öğle molası.",
        "Kıyıdaki, kısmen denizin içinde kalan eski hamam kalıntılarının yanında yüzme ve kısa bir yürüyüş.",
        "Ressam Bedri Rahmi Eyüboğlu'nun adını taşıyan koyda, kayadaki balık resmini arayın; akşam demirlemesi için de çok sevilir.",
        "Ormanın denize uzandığı derin ve sakin koyda son gün; ardından Göcek'e dönüş ve teslim.",
      ],
      en: [
        "Welcome in Göcek, settling into the cabins and provisioning; first evening in a quiet cove.",
        "Swimming and snorkelling stops in shallow turquoise water among the small islands.",
        "A day of swimming in the cove named for its clear water, where you can see the sandy bottom and the fish.",
        "Relaxing and a long lunch break in a calm, pine-fringed cove.",
        "Swimming and a short walk beside the old bath ruins on the shore, partly under the sea.",
        "In the cove named after the painter Bedri Rahmi Eyüboğlu, look for the fish painted on the rock; a favourite evening anchorage.",
        "Last day in the deep, calm cove where the forest meets the sea; then back to Göcek for hand-over.",
      ],
    },
  },
  "gocek-fethiye-korfezi": {
    from: "Göcek", to: "Göcek", port: "gocek",
    stops: ["Göcek", "Tersane Adası", "Kızılada", "Turunç Pınarı", "Gemiler Adası", "Katrancı Adası", "Göcek Adası"],
    days: {
      tr: [
        "Göcek'te karşılama, kabinlere yerleşme ve kumanya; ilk akşam sakin bir koyda.",
        "Eski tersane kalıntılarıyla bilinen adada yüzme ve kıyıda kısa bir yürüyüş.",
        "Fethiye körfezinin girişindeki deniz feneriyle bilinen adada, berrak suda yüzme ve şnorkel.",
        "Yalnızca denizden ulaşılan, kayalardan tatlı su süzülen serin koyda dinlenme günü.",
        "Bizans dönemi kilise ve yapı kalıntılarıyla dolu adada gün batımı yürüyüşü ve yüzme.",
        "Çamlarla çevrili sakin koyda uzun bir yüzme molası ve keyifli bir akşam.",
        "Göcek'in hemen önündeki adada son yüzme; ardından Göcek'e dönüş ve teslim.",
      ],
      en: [
        "Welcome in Göcek, settling into the cabins and provisioning; first evening in a quiet cove.",
        "Swimming and a short walk ashore on the island known for its old shipyard ruins.",
        "Swimming and snorkelling in clear water at the lighthouse island at the mouth of Fethiye Bay.",
        "A day of rest in the cool cove reachable only by sea, where fresh water trickles from the rocks.",
        "A sunset walk and swim on the island full of Byzantine church and building ruins.",
        "A long swimming break and a relaxed evening in a calm, pine-fringed cove.",
        "A last swim at the island just off Göcek; then back to Göcek for hand-over.",
      ],
    },
  },
  "fethiye-kekova": { from: "Fethiye", to: "Kekova", port: "fethiye", stops: ["Fethiye", "Ölüdeniz", "Seyir günü", "Kalkan & Kaş", "Meis", "Kekova", "Kekova"] },
  "fethiye-bozburun": {
    from: "Fethiye", to: "Bozburun", port: "fethiye",
    stops: ["Fethiye", "Tersane Adası", "Göbün", "Ekincik", "Bozukkale", "Söğüt", "Bozburun"],
    days: {
      tr: [
        "Fethiye'de karşılama, kabinlere yerleşme ve kumanya; ilk akşam körfezde sakin bir koyda.",
        "Eski tersane kalıntılarıyla bilinen adada yüzme ve kıyıda kısa bir yürüyüş.",
        "Göcek körfezinin çam ormanlarıyla çevrili, rüzgârdan korunaklı koyunda yüzme ve dinlenme.",
        "Dalyan deltasına yakın Ekincik'te demirleme; isteyenler için Kaunos ve kaya mezarlarına tekneyle gezi.",
        "Antik Loryma kalesinin yükseldiği korunaklı koyda yüzme ve kale kalıntılarına yürüyüş.",
        "Sakin bir köy koyunda yüzme, kıyıda yerel bir sofrada akşam yemeği.",
        "Tekne yapımıyla ünlü Bozburun'a varış, son kahvaltı ve teslim.",
      ],
      en: [
        "Welcome in Fethiye, settling into the cabins and provisioning; first evening in a quiet cove in the bay.",
        "Swimming and a short walk ashore on the island known for its old shipyard ruins.",
        "Swimming and rest in the sheltered, pine-fringed cove of Göcek Bay.",
        "Anchoring at Ekincik near the Dalyan delta; an optional boat trip to Kaunos and the rock tombs.",
        "Swimming in the sheltered cove below the ancient fortress of Loryma, with a walk up to the ruins.",
        "Swimming in a quiet village cove and dinner at a local table ashore.",
        "Arrival in Bozburun, famous for its boatbuilding; last breakfast and hand-over.",
      ],
    },
  },
  "kekova-bodrum": {
    from: "Kekova", to: "Bodrum", port: "kas",
    stops: ["Kekova", "Kaş", "Gemiler Adası", "Ağalimanı Koyu", "Serçe Limanı", "Knidos", "Bodrum"],
    days: {
      tr: [
        "Kekova'da karşılama; batık şehrin üzerinden süzülerek Kaleköy'e ve Simena kalesine yürüyüş.",
        "Beyaz evleri ve dar sokaklarıyla Kaş'ta yüzme, akşam kasabada yürüyüş ve yemek.",
        "Bizans dönemi kilise ve yapı kalıntılarıyla dolu adada gün batımı yürüyüşü ve yüzme.",
        "Çam ormanının denize indiği sakin ve korunaklı koyda yüzme ve dinlenme.",
        "Bozburun yarımadasının ucundaki, dar girişli ve rüzgârdan korunaklı doğal limanda yüzme.",
        "Datça yarımadasının ucundaki antik Knidos'ta tiyatro ve tapınak kalıntıları arasında yürüyüş.",
        "Bodrum'a varış, kalenin gölgesinde son kahvaltı ve teslim.",
      ],
      en: [
        "Welcome at Kekova; glide over the sunken city, then walk up to Kaleköy and Simena castle.",
        "Swimming in Kaş with its white houses and narrow streets; an evening stroll and dinner in town.",
        "A sunset walk and swim on the island full of Byzantine church and building ruins.",
        "Swimming and rest in a calm, sheltered cove where the pine forest meets the sea.",
        "Swimming in the narrow-mouthed, sheltered natural harbour at the tip of the Bozburun peninsula.",
        "A walk among the theatre and temple ruins of ancient Knidos at the tip of the Datça peninsula.",
        "Arrival in Bodrum, last breakfast in the shadow of the castle and hand-over.",
      ],
    },
  },
  "marmaris-ekincik-fethiye": {
    from: "Marmaris", to: "Fethiye", port: "marmaris",
    stops: ["Marmaris", "Kadırga Koyu", "Ekincik", "Dalyan", "Ağalimanı Koyu", "Kızılada", "Fethiye"],
    days: {
      tr: [
        "Marmaris'te karşılama, kabinlere yerleşme ve kumanya; ilk akşam marinada ya da yakın bir koyda.",
        "Çam ormanlarıyla çevrili, berrak sulu sakin koyda yüzme ve dinlenme.",
        "Dalyan deltasına yakın Ekincik'te demirleme, mağaralara yüzme ve akşam sessiz bir koy.",
        "Küçük teknelerle sazlıklar arasından Kaunos'a, kaya mezarlarına ve İztuzu plajına gezi.",
        "Rüzgârdan korunaklı sakin koyda uzun bir yüzme molası ve keyifli bir akşam.",
        "Fethiye körfezinin girişindeki deniz feneriyle bilinen adada, berrak suda yüzme ve şnorkel.",
        "Fethiye'ye varış, son kahvaltı ve teslim.",
      ],
      en: [
        "Welcome in Marmaris, settling into the cabins and provisioning; first evening at the marina or a nearby cove.",
        "Swimming and rest in a calm, clear-water cove fringed with pine forest.",
        "Anchoring at Ekincik near the Dalyan delta, swimming to the caves, and a quiet cove for the evening.",
        "A small-boat trip through the reeds to Kaunos, the rock tombs and İztuzu beach.",
        "A long swimming break and a relaxed evening in a calm, sheltered cove.",
        "Swimming and snorkelling in clear water at the lighthouse island at the mouth of Fethiye Bay.",
        "Arrival in Fethiye, last breakfast and hand-over.",
      ],
    },
  },
  "marmaris-hisaronu-korfezi": {
    from: "Marmaris", to: "Marmaris", port: "marmaris",
    stops: ["Marmaris", "Serçe Limanı", "Söğüt", "Selimiye", "Orhaniye", "Sömbeki Koyu", "Bozukkale"],
    days: {
      tr: [
        "Marmaris'te karşılama, kabinlere yerleşme ve kumanya; ilk akşam marinada ya da yakın bir koyda.",
        "Bozburun yarımadasının ucundaki, dar girişli ve rüzgârdan korunaklı doğal limanda yüzme.",
        "Sakin bir köy koyunda yüzme, kıyıda yerel bir sofrada akşam yemeği.",
        "Rengârenk evleri ve kıyı lokantalarıyla bilinen balıkçı köyünde yüzme ve akşam yürüyüşü.",
        "Denizin ortasında kum dili Kız Kumu'nda yürüyüş ve sığ, sıcak suda yüzme.",
        "Bozburun'un hemen yanındaki geniş ve korunaklı koyda yüzme ve dinlenme.",
        "Antik Loryma kalesinin yükseldiği koyda son yüzme ve kale yürüyüşü; ardından Marmaris'e dönüş ve teslim.",
      ],
      en: [
        "Welcome in Marmaris, settling into the cabins and provisioning; first evening at the marina or a nearby cove.",
        "Swimming in the narrow-mouthed, sheltered natural harbour at the tip of the Bozburun peninsula.",
        "Swimming in a quiet village cove and dinner at a local table ashore.",
        "Swimming and an evening stroll in the fishing village known for its colourful houses and seaside restaurants.",
        "A walk on Kız Kumu, the sandbar in the middle of the sea, and a swim in shallow, warm water.",
        "Swimming and rest in the wide, sheltered bay right next to Bozburun.",
        "A last swim below the ancient fortress of Loryma and a walk up to the ruins; then back to Marmaris for hand-over.",
      ],
    },
  },
  "bozburun-bodrum": {
    from: "Bozburun", to: "Bodrum", port: "bozburun",
    stops: ["Bozburun", "Datça", "Palamutbükü", "Tuzla Koyu", "İngiliz Limanı", "Kissebükü", "Bodrum"],
    days: {
      tr: [
        "Tekne yapımıyla ünlü Bozburun'da karşılama, kabinlere yerleşme ve kumanya; ilk akşam sakin bir koyda.",
        "Datça'da yüzme, akşam Eski Datça'nın taş sokaklarında yürüyüş ve yemek.",
        "Uzun çakıl plajı ve kıyıdaki balık lokantalarıyla bilinen koyda yüzme ve akşam yemeği.",
        "Gökova körfezinin rüzgârdan korunaklı, berrak sulu koyunda yüzme ve dinlenme.",
        "Ormanla çevrili, savaş yıllarında İngiliz botlarının saklandığı söylenen korunaklı koyda yüzme.",
        "Antik kalıntıların arasında, çam ormanının denize indiği sakin koyda son akşam.",
        "Bodrum'a varış, kalenin gölgesinde son kahvaltı ve teslim.",
      ],
      en: [
        "Welcome in Bozburun, famous for its boatbuilding; settling into the cabins and provisioning; first evening in a quiet cove.",
        "Swimming in Datça; an evening stroll and dinner in the stone streets of Old Datça.",
        "Swimming and dinner in the bay known for its long pebble beach and seaside fish restaurants.",
        "Swimming and rest in a sheltered, clear-water cove of the Gulf of Gökova.",
        "Swimming in the forest-fringed, sheltered cove where British boats are said to have hidden during the war.",
        "Last evening in a calm cove among ancient ruins, where the pine forest meets the sea.",
        "Arrival in Bodrum, last breakfast in the shadow of the castle and hand-over.",
      ],
    },
  },
  "bozburun-hisaronu-korfezi": {
    from: "Bozburun", to: "Bozburun", port: "bozburun",
    stops: ["Bozburun", "Dirsekbükü", "Selimiye", "Orhaniye", "Bencik Koyu", "Söğüt", "Bozburun"],
    days: {
      tr: [
        "Tekne yapımıyla ünlü Bozburun'da karşılama, kabinlere yerleşme ve kumanya; ilk akşam sakin bir koyda.",
        "Dağların arasına sokulmuş, rüzgârdan korunaklı derin koyda yüzme ve kıyıdaki küçük lokantada akşam yemeği.",
        "Rengârenk evleri ve kıyı lokantalarıyla bilinen balıkçı köyünde yüzme ve akşam yürüyüşü.",
        "Denizin ortasında kum dili Kız Kumu'nda yürüyüş ve sığ, sıcak suda yüzme.",
        "Fiyort gibi uzanan dar ve sakin koyda, çam gölgesinde yüzme ve dinlenme.",
        "Sakin bir köy koyunda yüzme, kıyıda yerel bir sofrada akşam yemeği.",
        "Bozburun'a dönüş, son kahvaltı ve teslim.",
      ],
      en: [
        "Welcome in Bozburun, famous for its boatbuilding; settling into the cabins and provisioning; first evening in a quiet cove.",
        "Swimming in a deep, sheltered cove tucked between the mountains, and dinner at the small restaurant ashore.",
        "Swimming and an evening stroll in the fishing village known for its colourful houses and seaside restaurants.",
        "A walk on Kız Kumu, the sandbar in the middle of the sea, and a swim in shallow, warm water.",
        "Swimming and rest in the shade of the pines in a narrow, calm, fjord-like inlet.",
        "Swimming in a quiet village cove and dinner at a local table ashore.",
        "Back to Bozburun, last breakfast and hand-over.",
      ],
    },
  },
  "bodrum-datca-hisaronu-korfezi": {
    from: "Bodrum", to: "Selimiye", port: "bodrum",
    stops: ["Bodrum", "Karaada", "Knidos", "Datça", "D-Maris Koyu", "Orhaniye", "Selimiye"],
    days: {
      tr: [
        "Bodrum'da karşılama, kabinlere yerleşme ve kumanya; ilk akşam kalenin karşısında.",
        "Mağarasındaki sıcak su kaynağı ve şifalı çamuruyla bilinen adada yüzme.",
        "Datça yarımadasının ucundaki antik Knidos'ta tiyatro ve tapınak kalıntıları arasında yürüyüş.",
        "Datça'da yüzme, akşam Eski Datça'nın taş sokaklarında yürüyüş ve yemek.",
        "Çam ormanlarıyla çevrili, turkuaz sulu sakin koyda yüzme ve dinlenme.",
        "Denizin ortasında kum dili Kız Kumu'nda yürüyüş ve sığ, sıcak suda yüzme.",
        "Rengârenk evleri ve kıyı lokantalarıyla bilinen balıkçı köyü Selimiye'ye varış, son kahvaltı ve teslim.",
      ],
      en: [
        "Welcome in Bodrum, settling into the cabins and provisioning; first evening facing the castle.",
        "Swimming at the island known for the hot spring and healing mud in its cave.",
        "A walk among the theatre and temple ruins of ancient Knidos at the tip of the Datça peninsula.",
        "Swimming in Datça; an evening stroll and dinner in the stone streets of Old Datça.",
        "Swimming and rest in a calm, turquoise cove fringed with pine forest.",
        "A walk on Kız Kumu, the sandbar in the middle of the sea, and a swim in shallow, warm water.",
        "Arrival in Selimiye, the fishing village known for its colourful houses and seaside restaurants; last breakfast and hand-over.",
      ],
    },
  },
  "bodrum-yunan-adalari": {
    from: "Bodrum", to: "Yalıkavak", port: "bodrum", greek: true,
    stops: ["Bodrum", "Kos", "Kalimnos", "Leros", "Patmos", "Arki", "Yalıkavak"],
    days: {
      tr: [
        "Bodrum'da karşılama, kabinlere yerleşme ve kumanya; pasaport ve çıkış işlemleri.",
        "Kos'ta giriş işlemleri; Hipokrat'ın çınarı ve antik agora çevresinde yürüyüş, akşam limanda yemek.",
        "Sünger avcılığıyla ünlü Kalimnos'ta rengârenk Pothia limanı ve berrak koylarda yüzme.",
        "İtalyan döneminin izlerini taşıyan Leros'ta sakin koylarda yüzme ve kale manzaralı akşam.",
        "Aziz Yuhanna Manastırı ve Vahiy Mağarası'yla bilinen Patmos'ta Hora'ya çıkış ve yüzme.",
        "Birkaç evden ibaret küçük Arki'de turkuaz koylarda yüzme ve balık tavernasında akşam yemeği.",
        "Türkiye'ye dönüş; Yalıkavak'ta giriş işlemleri, son kahvaltı ve teslim.",
      ],
      en: [
        "Welcome in Bodrum, settling into the cabins and provisioning; passport and exit formalities.",
        "Entry formalities in Kos; a walk around Hippocrates' plane tree and the ancient agora, dinner at the harbour.",
        "Kalymnos, famous for its sponge divers: the colourful harbour of Pothia and swimming in clear coves.",
        "Swimming in quiet coves on Leros, with its Italian-era heritage, and an evening with a view of the castle.",
        "Patmos, known for the Monastery of St John and the Cave of the Apocalypse: up to Chora, and a swim.",
        "Swimming in turquoise coves on tiny Arki and dinner at a fish taverna.",
        "Back to Türkiye; entry formalities in Yalıkavak, last breakfast and hand-over.",
      ],
    },
  },
  "marmaris-yunan-adalari": {
    from: "Marmaris", to: "Marmaris", port: "marmaris", greek: true,
    stops: ["Marmaris", "Bozburun", "Symi", "Rodos", "Rodos", "Serçe Limanı", "Marmaris"],
    days: {
      tr: [
        "Marmaris'te karşılama, kabinlere yerleşme ve kumanya; ilk akşam marinada ya da yakın bir koyda.",
        "Tekne yapımıyla ünlü Bozburun'da yüzme; akşam limanda yemek ve ertesi gün için çıkış işlemleri.",
        "Renkli neoklasik evleriyle Symi'de giriş işlemleri, limanda yürüyüş ve berrak koylarda yüzme.",
        "Rodos'ta şövalyelerin surlarla çevrili eski şehrinde, Üstatlar Sarayı ve dar sokaklarda gezinti.",
        "Rodos'ta ikinci gün: Lindos akropolüne gezi ya da plajlarda serbest zaman; akşam çıkış işlemleri.",
        "Türkiye'ye dönüş ve giriş işlemleri; Bozburun yarımadasının ucundaki korunaklı doğal limanda yüzme.",
        "Marmaris'e dönüş, son kahvaltı ve teslim.",
      ],
      en: [
        "Welcome in Marmaris, settling into the cabins and provisioning; first evening at the marina or a nearby cove.",
        "Swimming at Bozburun, famous for its boatbuilding; dinner at the harbour and exit formalities for the next day.",
        "Entry formalities on Symi with its colourful neoclassical houses; a harbour stroll and swimming in clear coves.",
        "Rhodes: a stroll through the walled Old Town of the Knights, the Palace of the Grand Master and the narrow lanes.",
        "Second day in Rhodes: a trip to the acropolis of Lindos or free time on the beaches; exit formalities in the evening.",
        "Back to Türkiye with entry formalities; swimming in the sheltered natural harbour at the tip of the Bozburun peninsula.",
        "Back to Marmaris, last breakfast and hand-over.",
      ],
    },
  },
  "datca-yunan-adalari": {
    from: "Datça", to: "Datça", port: "datca", greek: true,
    stops: ["Datça", "Bozburun", "Symi", "Rodos", "Rodos", "Bozukkale", "Datça"],
    days: {
      tr: [
        "Datça'da karşılama, kabinlere yerleşme ve kumanya; akşam Eski Datça'nın taş sokaklarında yürüyüş.",
        "Tekne yapımıyla ünlü Bozburun'da yüzme; akşam limanda yemek ve ertesi gün için çıkış işlemleri.",
        "Renkli neoklasik evleriyle Symi'de giriş işlemleri, limanda yürüyüş ve berrak koylarda yüzme.",
        "Rodos'ta şövalyelerin surlarla çevrili eski şehrinde, Üstatlar Sarayı ve dar sokaklarda gezinti.",
        "Rodos'ta ikinci gün: Lindos akropolüne gezi ya da plajlarda serbest zaman; akşam çıkış işlemleri.",
        "Türkiye'ye dönüş ve giriş işlemleri; antik Loryma kalesinin yükseldiği koyda yüzme ve kale yürüyüşü.",
        "Datça'ya dönüş, son kahvaltı ve teslim.",
      ],
      en: [
        "Welcome in Datça, settling into the cabins and provisioning; an evening stroll in the stone streets of Old Datça.",
        "Swimming at Bozburun, famous for its boatbuilding; dinner at the harbour and exit formalities for the next day.",
        "Entry formalities on Symi with its colourful neoclassical houses; a harbour stroll and swimming in clear coves.",
        "Rhodes: a stroll through the walled Old Town of the Knights, the Palace of the Grand Master and the narrow lanes.",
        "Second day in Rhodes: a trip to the acropolis of Lindos or free time on the beaches; exit formalities in the evening.",
        "Back to Türkiye with entry formalities; swimming below the ancient fortress of Loryma and a walk up to the ruins.",
        "Back to Datça, last breakfast and hand-over.",
      ],
    },
  },
  "bodrum-yarimadasi": {
    from: "Bodrum", to: "Bodrum", port: "bodrum",
    stops: ["Bodrum", "Akvaryum Koyu", "Bitez", "Gümüşlük", "Cennet Koyu", "Yalıkavak", "Karaada"],
    days: {
      tr: [
        "Bodrum'da karşılama, kabinlere yerleşme ve kumanya; ilk akşam kalenin karşısında.",
        "Adını berrak suyundan alan koyda, dipteki kumu ve balıkları görebileceğiniz bir yüzme günü.",
        "Mandalina bahçeleri ve sakin koyuyla Bitez'de yüzme, akşam sahilde yemek.",
        "Antik Myndos kalıntılarının yanındaki balıkçı köyünde yüzme ve gün batımında balık yemeği.",
        "Yarımadanın batı kıyısında, berrak ve sakin sulu koyda yüzme ve dinlenme.",
        "Yel değirmenleri ve marinasıyla Yalıkavak'ta yüzme, akşam marinada yürüyüş.",
        "Mağarasındaki sıcak su kaynağı ve şifalı çamuruyla bilinen adada son yüzme; ardından Bodrum'a dönüş ve teslim.",
      ],
      en: [
        "Welcome in Bodrum, settling into the cabins and provisioning; first evening facing the castle.",
        "A day of swimming in the cove named for its clear water, where you can see the sandy bottom and the fish.",
        "Swimming at Bitez with its tangerine orchards and calm bay; dinner on the shore.",
        "Swimming at the fishing village beside the ruins of ancient Myndos, and a fish dinner at sunset.",
        "Swimming and rest in a clear, calm cove on the western shore of the peninsula.",
        "Swimming at Yalıkavak with its windmills and marina; an evening stroll along the marina.",
        "A last swim at the island known for the hot spring and healing mud in its cave; then back to Bodrum for hand-over.",
      ],
    },
  },
  "bodrum-gokova-korfezi-rotasi": {
    from: "Bodrum", to: "Bodrum", port: "bodrum",
    stops: ["Bodrum", "Orak Adası", "Çökertme", "Söğüt", "İngiliz Limanı", "Tuzla Koyu", "Yedi Adalar"],
    days: {
      tr: [
        "Bodrum'da karşılama, kabinlere yerleşme ve kumanya; ilk akşam kalenin karşısında.",
        "Turkuaz suyu ve kayalık kıyılarıyla bilinen adada yüzme ve şnorkel.",
        "Gökova'nın kuzey kıyısındaki sakin köy koyunda yüzme, akşam kıyıdaki lokantada yemek.",
        "Gökova'nın doğusundaki yeşil, sakin köy koyunda yüzme ve köy sofrasında akşam yemeği.",
        "Ormanla çevrili, savaş yıllarında İngiliz botlarının saklandığı söylenen korunaklı koyda yüzme.",
        "Gökova körfezinin rüzgârdan korunaklı, berrak sulu koyunda yüzme ve dinlenme.",
        "Çam ormanının denize indiği adacıklar arasında son yüzme; ardından Bodrum'a dönüş ve teslim.",
      ],
      en: [
        "Welcome in Bodrum, settling into the cabins and provisioning; first evening facing the castle.",
        "Swimming and snorkelling at the island known for its turquoise water and rocky shores.",
        "Swimming in a quiet village cove on the northern shore of Gökova, and dinner at the restaurant ashore.",
        "Swimming in a green, quiet village cove in eastern Gökova, and dinner at a village table.",
        "Swimming in the forest-fringed, sheltered cove where British boats are said to have hidden during the war.",
        "Swimming and rest in a sheltered, clear-water cove of the Gulf of Gökova.",
        "A last swim among small islets where the pine forest meets the sea; then back to Bodrum for hand-over.",
      ],
    },
  },
  "bodrum-gocek": { from: "Bodrum", to: "Göcek", port: "bodrum", stops: ["Bodrum", "Knidos", "Datça", "Marmaris", "Ekincik", "Tersane Adası", "Göcek"] },
};

const EN_NAMES: Record<string, string> = {
  "Yassıcalar / Zeytin Adası": "Yassıca / Zeytin Island", "Akvaryum Koyu": "Aquarium Bay", "Hamam Koyu": "Hamam Bay", "Orak Adası": "Orak Island", "Çökertme": "Cokertme", "Cennet Koyu": "Cennet Bay", "Kalimnos": "Kalymnos", "Dirsekbükü": "Dirsekbuku", "Bencik Koyu": "Bencik Bay", "Palamutbükü": "Palamutbuku", "Tuzla Koyu": "Tuzla Bay", "İngiliz Limanı": "English Harbour", "Kissebükü": "Kissebuku", "Sömbeki Koyu": "Sombeki Bay", "Kadırga Koyu": "Kadirga Bay", "Ağalimanı Koyu": "Agalimani Bay", "Serçe Limanı": "Serce Harbour", "Turunç Pınarı": "Turunc Pinari", "Katrancı Adası": "Katranci Island", "Göcek Adası": "Gocek Island", "Kızılada": "Kizilada",
  "Seyir günü": "Sailing day", "Serbest gün": "Free day", "Dönüş": "Return", "Tersane Adası": "Tersane Island", "Gemiler Adası": "Gemiler Island",
  "Sedir Adası": "Sedir Island", "12 Adalar": "12 Islands", "Rodos": "Rhodes", "Meis": "Kastellorizo",
};
const GENERIC = new Set(["Seyir günü", "Serbest gün", "Dönüş"]);
const nm = (s: string, lang: Lang) => (lang === "en" ? EN_NAMES[s] ?? s : s);

// Bulunma eki düzeltmesi: "Bodrum'te" → "Bodrum'da", "Fethiye'te" → "Fethiye'de".
function fixTr(t: string) {
  return t.replace(/([A-Za-zÇĞİÖŞÜçğıöşü]+)'(te|ta|de|da)\b/g, (_, w: string) => {
    const v = [...w.toLowerCase()].reverse().find((c) => "aeıioöuü".includes(c)) ?? "e";
    const back = "aıou".includes(v);
    const hard = "fstkçşhp".includes(w.slice(-1).toLowerCase());
    return `${w}'${hard ? "t" : "d"}${back ? "a" : "e"}`;
  });
}

export type Activity = "swim" | "snorkel" | "walk" | "dinner" | "sunset" | "history" | "market" | "sail" | "passport" | "beach" | "relax";
const ACT: [Activity, RegExp][] = [
  ["swim", /yüzme|swim/i], ["snorkel", /şnorkel|dalış|snorkel|div/i], ["walk", /yürüyüş|walk/i], ["dinner", /yemeğ|yemek|balık|dinner|fish|meal/i],
  ["sunset", /gün batımı|sunset/i], ["history", /antik|batık|kale|tarih|ancient|sunken|castle|ruins|old town|eski şehir/i], ["market", /çarşı|pazar|market|bazaar/i],
  ["sail", /seyir|uzun etap|sailing|long leg/i], ["passport", /belge|giriş|document|formalit/i], ["beach", /plaj|kumsal|beach/i], ["relax", /dinlenme|serbest|sakin|relax|free day|calm|quiet/i],
];

export type RouteDay = { n: number; title: string; text: string; acts: Activity[] };
export type RouteInfo = {
  from: string; to: string; loop: boolean; greek: boolean; port: string | null;
  days: RouteDay[]; chart: string[]; intro: string; note: string; whoFor: string[]; outro: string;
};

export function routeInfo(p: Post, lang: Lang): RouteInfo {
  const m = META[p.slug];
  const src = lang === "tr" ? fixTr(p.content) : p.content;
  const lines = src.split("\n");
  const days: RouteDay[] = [];
  const intro: string[] = [];
  const who: string[] = [];
  const outro: string[] = [];
  let sec: "intro" | "days" | "who" | "other" = "intro";
  for (const raw of lines) {
    const l = raw.trim();
    if (!l) continue;
    if (l.startsWith("## ")) {
      sec = /gün gün|day by day/i.test(l) ? "days" : /kimlere|who is it/i.test(l) ? "who" : "other";
      continue;
    }
    const d = l.match(/^[-*]\s*\*\*(?:Gün|Day)\s*(\d+):?\*\*:?\s*(.*)$/i);
    if (d) {
      const n = Number(d[1]);
      const body = d[2].trim();
      const c = body.indexOf(":");
      const stop = m?.stops[n - 1];
      const title = stop ? nm(stop, lang) : c > 0 ? body.slice(0, c) : body.split(/[,;(]/)[0];
      const before = c > 0 ? body.slice(0, c).trim() : "";
      const simple = before.toLocaleLowerCase("tr") === title.toLocaleLowerCase("tr") || /^(seyir günü|serbest gün|sailing day|free day)$/i.test(before);
      let text = c > 0 && c < 70 && simple ? body.slice(c + 1).trim() : body;
      text = text.charAt(0).toLocaleUpperCase(lang === "tr" ? "tr" : "en") + text.slice(1);
      days.push({ n, title, text, acts: ACT.filter(([, re]) => re.test(body)).map(([a]) => a).slice(0, 3) });
      continue;
    }
    if (/^(rota seçiminde|if you need help)/i.test(l)) { outro.push(l); sec = "other"; continue; }
    if (sec === "intro") intro.push(l);
    else if (sec === "who") { if (!/ek masraf|ek ücret|extra cost|extra fee|additional cost/i.test(l)) who.push(l.replace(/^[-*]\s*/, "")); }
    else outro.push(l);
  }
  if (m?.days) {
    const list = m.days[lang === "tr" ? "tr" : "en"];
    days.length = 0;
    list.forEach((text, i) => days.push({ n: i + 1, title: nm(m.stops[i], lang), text, acts: ACT.filter(([, re]) => re.test(text)).map(([a]) => a).slice(0, 3) }));
  }
  const introText = intro.join(" ");
  const parts = introText.split(/(?<=\.)\s+/);
  const isNote = (s: string) => /örnektir|is an example|kaptanınız|captain may/i.test(s);
  const chart: string[] = [];
  for (const s of m?.stops ?? days.map((d) => d.title)) {
    if (GENERIC.has(s)) continue;
    const label = nm(s, lang);
    if (chart[chart.length - 1] !== label) chart.push(label);
  }
  const from = m?.from ?? p.title.split(/\s[-–/]\s/)[0];
  const to = m?.to ?? p.title.split(/\s[-–/]\s/).slice(-1)[0];
  const loop = from === to;
  if (loop && chart.length > 1 && chart[chart.length - 1] === chart[0]) chart.pop();
  return {
    from: nm(from, lang), to: nm(to, lang), loop, greek: !!m?.greek || /yunan|greek/i.test(p.title), port: m?.port ?? null,
    days, chart, intro: parts.filter((s) => !isNote(s)).join(" "), note: parts.filter(isNote).join(" "), whoFor: who, outro: outro.join(" "),
  };
}

export const ROUTE_UI = {
  tr: {
    eyebrow: "Klasik rota", days: (n: number) => `${n} gün · ${Math.max(n - 1, 1)} gece`, from: "Kalkış", to: "Varış", loop: "Aynı limana dönüş", oneway: "Tek yön",
    stops: (n: number) => `${n} durak`, greek: "Yunan adaları", quote: "Bu rota için teklif alın", program: "Programı görün", dayLabel: "Gün",
    programEyebrow: "Gün gün program", programTitle: "Rotanızın akışı.", whoEyebrow: "Kimlere uygun?", noteTitle: "Program esnektir",
    onewayNote: "Tek yön rotalarda tekne bir limandan alınıp başka bir limanda teslim edilir; bu durum tekneye göre ek ücret getirebilir.",
    greekNote: "Yunan adalarına geçişte pasaport ve giriş-çıkış işlemleri gerekir. Belgeleri rezervasyon sırasında birlikte netleştiririz.",
    boatsEyebrow: "Bu rotaya uygun tekneler", boatsTitle: (p: string) => `${p} çıkışlı tekneler`, allBoats: "Tüm tekneler",
    ctaTitle: "Bu rotada yelken açmaya hazır mısınız?", ctaText: "Tarihlerinizi ve kişi sayınızı yazın, size uygun tekneyi ve programı birlikte netleştirelim.", write: "Bize yazın",
    more: "Diğer rotalar", all: "Tümü", allRoutes: "Tüm rotalar", filter: "Kalkış limanı", route: "Rotayı incele", count: (n: number) => `${n} rota`, chartLabel: "Rota şeması",
    acts: { swim: "Yüzme", snorkel: "Şnorkel", walk: "Yürüyüş", dinner: "Akşam yemeği", sunset: "Gün batımı", history: "Tarih", market: "Çarşı", sail: "Uzun seyir", passport: "Pasaport", beach: "Plaj", relax: "Dinlenme" },
  },
  en: {
    eyebrow: "Classic route", days: (n: number) => `${n} days · ${Math.max(n - 1, 1)} nights`, from: "Departure", to: "Arrival", loop: "Round trip", oneway: "One way",
    stops: (n: number) => `${n} stops`, greek: "Greek islands", quote: "Get a quote for this route", program: "See the programme", dayLabel: "Day",
    programEyebrow: "Day by day", programTitle: "How your voyage unfolds.", whoEyebrow: "Who is it for?", noteTitle: "A flexible programme",
    onewayNote: "On one-way routes the boat is picked up in one port and returned in another; depending on the boat, this may involve an extra fee.",
    greekNote: "Crossing to the Greek islands requires passports and entry/exit formalities. We'll sort out the documents together when you book.",
    boatsEyebrow: "Boats for this route", boatsTitle: (p: string) => `Boats departing from ${p}`, allBoats: "All boats",
    ctaTitle: "Ready to set sail on this route?", ctaText: "Tell us your dates and group size, and we'll finalise the right boat and programme together.", write: "Write to us",
    more: "More routes", all: "All", allRoutes: "All routes", filter: "Departure port", route: "View route", count: (n: number) => `${n} routes`, chartLabel: "Route chart",
    acts: { swim: "Swimming", snorkel: "Snorkelling", walk: "Walking", dinner: "Dinner", sunset: "Sunset", history: "History", market: "Market", sail: "Long sail", passport: "Passport", beach: "Beach", relax: "Relaxing" },
  },
};

export type CardData = { slug: string; title: string; excerpt: string; href: string; from: string; to: string; loop: boolean; greek: boolean; days: number; chart: string[] };
export function toCard(p: Post, lang: Lang): CardData {
  const R = routeInfo(p, lang);
  return { slug: p.slug, title: p.title, excerpt: p.excerpt, href: href(lang, `/rotalar/${p.slug}`), from: R.from, to: R.to, loop: R.loop, greek: R.greek, days: R.days.length, chart: R.chart };
}
