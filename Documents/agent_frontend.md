# Frontend (Angular 20)

Arkitektur: Komponentbaserad struktur med tjänster (Services) för API-anrop.

## Token-hantering

- Säker lagring av JWT (LocalStorage eller Cookies).
- Bifoga token i samtliga headers vid förfrågningar till API:et.

## Navigation

- Meny för att växla mellan Bok-vyn och Citat-vyn.
- Responsiv mobilmeny (hamburger-meny) vid mindre skärmar.

## Funktioner & Vyer

### Start-sidan (utloggad)

- Enkel layout 
- Välkommen till Mind Vault
- En hemsida där du kan förvara dina bästa böcker och citat

### Bok-sidan (inloggad Startsida):

- Lista över alla böcker.
- Knapp för "Lägg till ny bok" (omdirigering till formulär).
- "Redigera"-knapp för varje bok (omdirigering till formulär).
- "Radera"-knapp för varje bok (omedelbar borttagning).

### Citat-sidan ("Mina citat"):

- Visa en lista på (minst) 5 citat.
- Funktionalitet för att lägga till, radera och redigera citaten direkt i vyn eller via formulär.

### Inloggning/Registrering:

- Sida för att skapa konto.
- Sida för att logga in.

## Design & UX

- Styling: Använd Bootstrap för layout och komponenter.
- Ikoner: Implementera Font Awesome för knappar och navigering.

## Responsivitet

- Layouten ska anpassa sig efter Desktop, Tablet och Mobil.
- Kontrollera avstånd (padding/margin) och justering i alla vyer.
- Extra Utmaning: Knapp för att växla mellan Light Mode och Dark Mode.