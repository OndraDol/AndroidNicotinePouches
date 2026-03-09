# PouchLog - Android Native App

Tato aplikace byla vygenerována a nakonfigurována pro operační systém Android. Kód obsahuje plně funkční port webové verze PouchLog, napsaný v **React Native (Expo)**, optimalizovaný na výkon a vybavený plným offline módem, haptikou, nativními gesty a synchronizací s Firebase.

---

## 🚀 Jak aplikaci spustit a otestovat na svém telefonu (DOPORUČENO)

Jelikož nemáš dostatečně silný počítač na běh lokálního emulátoru (Android Studio vyžaduje hodně RAM), testujeme aplikaci **živě na reálném zařízení**.

### Krok 1: Připrav si telefon
1. Otevři na svém mobilním telefonu obchod **Google Play** (nebo App Store na iPhonu).
2. Vyhledej a nainstaluj si bezplatnou aplikaci **Expo Go**.
3. Ujisti se, že tvůj počítač i telefon jsou připojeny na stejnou Wi-Fi síť.

### Krok 2: Spusť vývojový server
1. Otevři v tomto projektu terminál (vlož cestu k `AndroidNicotinePouches`).
2. Napiš příkaz:
   ```bash
   npx expo start
   ```
3. Počkej pár sekund. V terminálu se ti objeví velký **QR kód**.

### Krok 3: Naskenuj a hraj
1. Otevři fotoaparát na svém telefonu (nebo rovnou aplikaci Expo Go).
2. Naskenuj QR kód z tvého monitoru.
3. Aplikace se okamžitě stáhne (pár MB v lokální síti) a otevře se ti plnohodnotné rozhraní PouchLog rovnou na displeji telefonu! Kdykoliv upravíš kód na PC, na mobilu se změna vteřinově projeví.

---

## 📦 Jak vytvořit finální .APK soubor pro instalaci

Když už appku nechceš spouštět z Terminálu, potřebuješ ji "zabalit" (.apk soubor). Zde se vyhneme zatížení tvé RAM a procesoru a přenecháme náročnou práci **cloudovým serverům Expa (EAS)**, o kterých jsme se bavili na začátku.

1. Zaregistruj si zdarma účet na webu [expo.dev](https://expo.dev).
2. V terminálu do tohoto projektu zadej příkaz pro přihlášení:
   ```bash
   npx eas login
   ```
3. Zadej své jméno a heslo z kroku 1.
4. Spusť proces Cloudového Buildování příkazem:
   ```bash
   npx eas build -p android --profile preview
   ```
5. Potvrď případné dotazy na vygenerování keystoru (dej jen "Y" - Yes).
6. Nyní tvůj počítač nahrál zdrojový kód do cloudu. Můžeš terminál klidně zavřít. Nástroj ti poskytne **hyperliónk**, kam stačí kliknout a sledovat frontu na serveru.
7. Zhruba za 10 až 15 minut bude proces na cizím serveru hotov a zobrazí ti **Install QR Code**. Po naskenování QR kódu ti mobil sám stáhne `.apk` soubor a ty už máš na obrazovce klasickou zelenou ikonku **PouchLog**, která pojede už i tehdy, pokud máš počítač dávno vypnutý.
