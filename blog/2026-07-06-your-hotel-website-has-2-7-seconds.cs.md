---
title: "Váš hotelový web má 2,7 sekundy, než host odejde — využijte je"
date: "2026-07-06"
excerpt: "Mobilní cestující opouštějí hotelový web při třech sekundách načítání. Objekty, které si v roce 2026 udržují marži přímé rezervace, jsou ty, které to už vědí — a už to vyřešily."
metaDescription: "Výkon hotelového webu přímo určuje konverzi přímé rezervace. Proč Core Web Vitals na 2,7 sekundy hrají roli a co musí hoteliéři opravit, aby přestali ztrácet mobilní rezervace."
image: "https://images.unsplash.com/photo-1541560052-3744e48ab80b?w=1200&q=80"
slug: "your-hotel-website-has-2-7-seconds"
---

## Tříssekundový práh

Cestující hledající hotely na telefonu dává webu v průměru 2,7 sekundy, než se rozhodne, jestli zůstat nebo odskočit. Při třech sekundách vlastní data Google ukazují, že míra okamžitého opuštění na mobilu vzroste o 32 %. Při pěti sekundách se více než zdvojnásobí. Hotely, které se načtou pod 2,5 sekundami, návštěvníka udrží; hotely, které se načtou za pět sekund, ztrácejí přes polovinu návštěvníků, kteří se dostali dost blízko, aby značku viděli.

To má váhu, protože hotelové weby jsou neobvykle náročné na načtení. Typická homepage objektu nese 30–50 obrázků ve vysokém rozlišení, vnořený rezervační engine, několik tracking pixelů, chat widget, někdy video hero a cookie banner — vše soutěží o prvních 2,7 sekundy. Bez aktivního inženýrství je výsledkem načtení za 6–8 sekund na reálném mobilním připojení a stálá, neviditelná ztráta každého návštěvníka, který by si rezervoval.

## Co Core Web Vitals skutečně měří

Core Web Vitals od Google jsou tři čísla, která společně určují, zda je váš web „rychlý" podle standardu, který dnes uplatňují vyhledávače i cestující:

**Largest Contentful Paint (LCP)** — jak dlouho trvá, než se vykreslí největší viditelný prvek (obvykle hero obrázek). Cíl: pod 2,5 sekundy.

**Interaction to Next Paint (INP)** — jak responzivně stránka reaguje na klepnutí a kliknutí. Cíl: pod 200 milisekund.

**Cumulative Layout Shift (CLS)** — jak moc stránka při načítání poskakuje (reklamy, bannery, opožděně přicházející obrázky). Cíl: pod 0,1.

Nejsou to jen faktory řazení SEO (i když jimi jsou). Je to rozdíl mezi hostem, který dorazí k vašemu rezervačnímu engine, a hostem, který kartu zavře dřív, než vůbec uvidí vaše sazby.

## Kde hotelové weby tiše selhávají

**Předimenzované hero obrázky.** JPEG o velikosti 4 MB lobby vypadá nádherně na monitoru Macu a katastroficky na 4G telefonu. Moderní hotelové weby servírují hero obrázek pod 250 KB ve formátu WebP nebo AVIF, s responzivními zdroji pro různé velikosti obrazovek. Většina hotelových webů stále servíruje stejný 4MB JPEG na každé zařízení.

**Skripty blokující vykreslení.** Rezervační enginy, chat widgety, tracking pixely, A/B testing nástroje — každý načtený synchronně zpomaluje LCP o stovky milisekund. Řešení je přímočaré (deferred nebo async načítání), ale vyžaduje disciplínu, která většině šablonovaných hotelových webů chybí.

**Cookie bannery blokující obsah.** Souhlasový dialog, který vytlačí hero obrázek mimo obrazovku do přijetí, přispívá jak k selhání LCP, tak k vysokému CLS. Moderní implementace renderuje banner jako overlay bez posunutí stránky pod ním.

**Iframy rezervačního engine.** Rezervační engine načtený jako iframe je samostatná stránka uvnitř vaší stránky, s vlastními skripty, fonty a sledováním. Bývá nejpomalejším prvkem hotelového webu. Moderní platformy přímých rezervací se renderují inline jako součást stejného DOM, sdílejí fonty a kompletně odstraňují penalizaci iframe.

**Auto-play video heroes.** Tiché 8MB MP4 smyčkující za textem je jediný největší zabiják LCP na hotelových webech. Řešením bývá nahradit ho statickým obrázkem a interakcí „přehrát video".

## Jak vypadá zisková rychlost v roce 2026

Hotelový web vhodný pro cestujícího roku 2026 zasáhne:

- **LCP pod 2,5 sekundami** na Androidu střední třídy přes 4G, měřeno na 75. percentilu reálných uživatelů (ne v syntetickém nejlepším případě)
- **INP pod 150 milisekund** na 75. percentilu
- **CLS pod 0,05** v celé session
- **Celkovou váhu stránky pod 1,5 MB** v úvodním mobilním zobrazení
- **First input rezervačního engine pod 1 sekundu** od příchodu na rezervační stránku

Tato čísla jsou se současnou technologií dosažitelná. Dosáhnout jich na existujícím webu vyžaduje zaměřený inženýrský úsilí — obvykle čtyři až osm týdnů —, ale zvýšení konverze tu práci typicky zaplatí v jediném čtvrtletí.

## Matematika konverze

Objekt běžící na pěti sekundách mobilního načtení s mírou mobilní přímé konverze 1,5 %, dovedený k 2,5 sekundám načtení, vidí průměrnou míru konverze posunout se na 2,6 %. U objektu generujícího 800 mobilních session denně to znamená 8,8 dalších rezervací denně, tedy zhruba 265 dalších přímých rezervací měsíčně. Při průměrné sazbě 150 € a 25% ušetřené provizi vůči OTA je to přibližně 10 000 € měsíčně získané přímé marže — opakující se, skládající se a založené čistě na zlepšení času načtení.

Proto Core Web Vitals už není věc SEO. Je to věc marže přímé rezervace, s měřitelným měsíčním dopadem na příjmy, na webu, který má provoz už dnes.

## Co by hoteliéři měli udělat v tomto čtvrtletí

**Nejprve měřte.** Proženete svůj web přes PageSpeed Insights a podívejte se na sekci „Field Data" — to je, co prožívají reální uživatelé, ne syntetický test. Pokud LCP přesahuje 3 sekundy, web přichází o rezervace.

**Auditujte své hero.** Pokud je hero homepage JPEG větší než 250 KB nebo auto-play video, je to jediná největší oprava.

**Sepište si skripty.** Jakýkoli skript, který není rezervační engine, analytika nebo striktně nezbytný, by měl být odložen nebo odstraněn.

**Zkontrolujte integraci rezervačního engine.** Pokud se načítá jako iframe, platíte výraznou výkonovou daň. Moderní rezervační platformy se renderují inline.

**Nastavte rozpočet.** Rozhodněte, jaký cíl mobilního LCP musí web zasáhnout, a každé jeho překročení považujte za produkční bug, ne za „bylo by hezké".

## Kde do toho Bookassist zapadá

[Program Web Design od Bookassist](https://bookassist.org/web-design) staví hotelové weby s Core Web Vitals jako požadavkem na vydání, ne post-launch starostí. Každý objekt startuje s LCP pod 2,5 sekundami na 75. percentilu, s inline rezervačním engine sdílejícím stack hostitelského webu a s výkonnostním rozpočtem, který musejí respektovat následné úpravy obsahu. Hotely po launchi typicky zaznamenávají míru konverze přímé rezervace nad 15 % — číslo dosažitelné jen tehdy, když je web dost rychlý na to, aby návštěvníka udržel dost dlouho na to, aby konvertoval.

Spusťte zdarma Technologický audit hotelu na své nemovitosti, abyste viděli, jak vaše současné Core Web Vitals obstojí ve srovnání s benchmarkem 2026 a které opravy nejrychleji uzavřou největší výkonnostní mezery.

---
*Foto: [charlesdeluvio](https://unsplash.com/@charlesdeluvio) na [Unsplash](https://unsplash.com)*
