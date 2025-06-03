# SlimMom Backend

Backend Node.js/Express pentru aplicația SlimMom.

## Cerințe

- Node.js v18+
- MongoDB (Atlas sau local)

## Configurare

1. Clonează repository-ul:
   ```
   git clone https://github.com/tania1103/slim_mom-backend.git
   cd slim_mom-backend
   ```

2. Instalează dependențele:
   ```
   npm install
   ```

3. Creează un fișier `.env` în directorul rădăcină și adaugă:

   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   REFRESH_SECRET=your_refresh_secret
   ```

4. Pornește serverul:
   ```
   npm run dev
   ```
   sau
   ```
   npm start
   ```

Serverul va porni pe portul 5000 (sau portul setat în cod).

## Endpoint-uri principale

- `POST /api/auth/register` – Înregistrare utilizator
- `POST /api/auth/login` – Autentificare utilizator
- `POST /api/auth/logout` – Deconectare
- `POST /api/auth/refresh` – Refresh token
- `GET /api/products/search` – Căutare produse
- `POST /api/diary/add` – Adaugă produs la jurnal
- `POST /api/diary/delete` – Șterge produs din jurnal
- `GET /api/diary/:date` – Informații jurnal pe zi
- Documentație Swagger: `/api-docs`

## Notă

- Nu publica fișierul `.env` cu date reale!
- Pentru deploy, folosește variabile de mediu sigure.
