# Miesieczny Dziennik Relacji Lidera (MVP)

Prosta aplikacja React + Supabase do zbierania wpisow po rozmowach miedzy liderami.

## 1) Uruchomienie lokalne

```bash
npm install
npm run dev
```

Aplikacja wystartuje domyslnie na `http://localhost:5173`.

## 2) Podpiecie Supabase

1. Utworz projekt w Supabase.
2. W SQL Editor odpal skrypt z pliku `supabase/schema.sql`.
3. Skopiuj `.env.example` do `.env`.
4. Ustaw:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_PIN` (np. `1234`)
5. Zrestartuj `npm run dev`.

## 3) Deploy na Vercel

1. Wrzuc repo na GitHub.
2. W Vercel: `Add New Project` i wybierz repo.
3. Framework: `Vite` (wykryje sie automatycznie).
4. Dodaj zmienne srodowiskowe:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_PIN`
5. Kliknij `Deploy`.

## Struktura

- `src/App.jsx` routing
- `src/pages/SelectUser.jsx`
- `src/pages/SelectPartner.jsx`
- `src/pages/Form.jsx`
- `src/pages/Admin.jsx`
- `src/pages/Presentation.jsx`
- `src/components/Button.jsx`
- `src/components/Card.jsx`
- `src/components/Input.jsx`
- `src/components/Select.jsx`
- `src/lib/supabaseClient.js`
- `src/data/users.js`
- `src/data/questions.js`
