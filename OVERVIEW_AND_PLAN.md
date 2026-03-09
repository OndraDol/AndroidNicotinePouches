# PouchLog Android (React Native / Expo) - Overview & Implementation Plan

Tento dokument slouží jako centrální technický a produktový přehled ('Overview') pro mobilní port aplikace **PouchLog**, původně vytvořené jako Single Page Web Application (SPA/PWA), a zároveň jako **Plán implementace** rozdělený na postupné kroky pro dosažení funkční parity s webovou verzí s důrazem na nativní User Experience.

---

## 📖 Celkové Overview Projektu

### Co to je?
Mobilní verze aplikace **PouchLog**, nativního pomocníka navrženého k osobnímu monitoringu užívání nikotinových sáčků, gamifikaci odvykání a optimalizaci nákladů, postavená na technologii **React Native & Expo**. Celý kód se nachází ve struktuře Expo Router aplikací. 

### Co to dělá?
Umožňuje užívateli kompletní správu jeho nikotinových zvyklostí.  
- **Dashboard a Sledování:** Zaznamenávání jednotlivých spotřebovaných sáčků v reálném čase.  
- **Statistiky (Analytics):** Počítání denních útrat, absorbovaného množství nikotinu, dlouhodobých streaků beze změny limitů a zobrazování dat do grafů.  
- **Strategie odvykání (Wizard):** Funkce pro sledování pouhého užití ("Just Track") i pokročilá "Freedom Journey" počítající lineární (Smooth), týdenní (Weekly) a striktní (Cold Turkey) sestup konzumace sáčků.  
- **Gamifikace (Milestones):** Zisk 16 nativních odznaků dle zásluh a reálná biologická osa zdravotního zotavování (Health Timeline).  

### Proč to děláme (Důvody pro refactoring PWA -> Native Mobile)?
- **Výkon a optimalizace na omezeném HW:** Na 16GB RAM počítači je vhodnější vyvíjet v Expo a kompilace dedikovat na Expo Application Services (EAS) v cloudu než renderovat WebView v klasické PWA. Testování provádíme na skutečném telefonu přes Expo Go.
- **Nativní Gesta:** Přejít z těžkopádných Webových alertů, promptů a `<dialog>` do nativních prvků – integrace Gesta *Swipe-to-delete*, hladkých *Bottom Sheets*, nativních Push Push Notifikací a plnohodnotné haptické odezvy (`expo-haptics`).

### Jak to dělá po technické stránce?
- **Framework:** `Expo` + `React Native` pro stavbu Multi-Platform vrstvy. Používá App Router (`app/`)
- **State Management:** `Zustand` s `AsyncStorage` jako perzistentním backendem cache pro nahrazení `localStorage` z původního webu.
- **Backend a Synchronizace:** Integrace nativní Firebase (skrze Expo/RN implementaci), řešící Cloud Sync (Firestore) a Přihlašování s `AsyncStorage` persistencí.
- **Design:** CSS struktura byla zmigrována na `StyleSheet` společně s dynamickým přepínáním Barev (Light/Dark `useColorScheme`).
- **Lokalizace:** `i18next` pro správu CS (čeština) / EN (angličtina) slovníků.

---

## 🛠 Plán Implementace (Roadmap)

Tento plán jasně definuje pořadí prací. Splněné body budou označeny.

### Fáze 1: Setup & Scaffolding (✅ Dokončeno)
- [x] Smazat vzorový kód z `npx create-expo-app` a definovat Tabs Layout (`app/(tabs)`).
- [x] Nainstalovat potřebný Tech Stack: `zustand`, `@react-native-async-storage/async-storage`, `i18next`, `expo-localization`, `firebase`, `react-native-svg` (pro grafy).
- [x] Extrahovat `POUCH_DB` a parametry designu (Barvy, Témata) z původního webu a integrovat do složky `src/constants`.
- [x] Definovat základní `cs.json`, `en.json` a index soubor pro lokalizaci.
- [x] Vytvořit prázdné Skeleton obrazovky v Routeru: `index` (Dashboard), `history`, `milestones`, `settings`.
- [x] Vybudovat první `Zustand` Store s pre-konfigurací Persistence a Theme/History datovým modelem.

### Fáze 2: State Management & Offline Data Logic (✅ Dokončeno)
- [x] Vytvořit plnou aplikační logiku v Zustandu pro přepočítávání **Strategií (Wizard/Limits)**, abychom zreplikovali funkci `getDynamicLimitForDate`.
- [x] Implementovat helperové funkce z webu pro výpočet Streaků, ušetřených peněz, průměru, úspěchů ze včerejška.
- [x] Logika odznaků (`BADGES_DEF`) převedena do formátovaného seznamu pro snazší render.
- [x] Příprava Custom Pouches pro Zustand přidání.

### Fáze 3: Bottom Sheets a Modální Kontejnery (Nativizace UI) (✅ Dokončeno)
- [x] Instalace a integrace knihovny `@gorhom/bottom-sheet` a `react-native-gesture-handler`.
- [x] Implementace Pickeru značek (Search) do Bottom Sheetu místo HTML modalu (Pika pika interface pro `Quick Add`).
- [x] Integrace výběru Zpětného data (`Backdate`) do nativních pickerů (`@react-native-community/datetimepicker`).

### Fáze 4: Vývoj Jednotlivých Obrazovek (Views) (✅ Dokončeno)
- [x] **Dashboard (`index.tsx`):** Propojit Zustand Storu pro zobrazení Limitů, ProgressBaru a Quick Actions přes plně nativní element.
- [x] **History (`history.tsx`):** Vložit plnohodnotný komponent Gesta *Swipe-to-delete* využíváním balíčků React Native Reanimated v `<FlatList>`.
- [x] **Milestones (`milestones.tsx`):** Mapování listu Achievementů (BadgeGrid) a vybudování Health Timeline vizuálu dle webové podoby.
- [x] **Settings (`settings.tsx`) & Onboarding:** Vybudována obrazovka s parametry omezující užívání, Switch Dark modu a sekce Data Management s haptikou.
- [x] **Grafy v Dashboardu:** Integrovat Chart kit s dynamickými daty pro Trend využití posledních 7 dnů na Dashboardu.

### Fáze 5: Firebase Cloud Sync Services (✅ Dokončeno)
- [x] Vybudování `src/services/firebase.ts` replikující nativní config z webové varianty (propojeno s real projektem).
- [x] Vytvoření modulu `src/services/sync.ts` - obsluha logiky pro Push / Pull dat vázaných na konkrétní `UID` uživatele ve `firestore`.
- [x] Implementace FireAuth s E-mail & Password login rozhraním nativně umístěno do karty nastavení (Settings).
- [x] Spuštění manuálního zálohovadla a stahovadla zapsaného rovnou do vnitřního `Zustand` state manageru napříč Androidem.

### Fáze 6: Polish (Haptika, EAS a Lokální Build) (✅ Dokončeno)
- [x] Doplnit komplexní `expo-haptics` (na Button kliky při mazání, potvrzení přihlášení a vyskakování pickerů).
- [x] Přepsána `app.json` (Nastavení nového Bundle ID: `com.ondrejdolejs.pouchlog` a nového názvu **PouchLog**).
- [x] Aplikovány ikony z původního Webu (`icon-512.png`, `icon-192.png`) rovnou na nativní assety pro Launcher a pro *Splash Screen*. Vyřešeny dynamické Android 12+ pozadí.
- [x] **Kompilační návod připraven:** EAS Cloud je připojený pro sestavení Android `.apk` bez zátěže lokálního RAM.
