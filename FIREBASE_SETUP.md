# Firebase Setup

## Konfiguracja Firebase

1. Skopiuj `android/app/google-services.json.example` do `android/app/google-services.json`
2. Pobierz oryginalny plik `google-services.json` z Firebase Console:
   - Idź do [Firebase Console](https://console.firebase.google.com/)
   - Wybierz projekt
   - Project Settings → Your apps → Android app
   - Download google-services.json
3. Zastąp skopiowany plik oryginalnym plikiem z Firebase

## UWAGA BEZPIECZEŃSTWA
- **NIE** commituj pliku `google-services.json` do repozytorium
- Plik zawiera wrażliwe klucze API Firebase
- Jest automatycznie ignorowany przez `.gitignore`
