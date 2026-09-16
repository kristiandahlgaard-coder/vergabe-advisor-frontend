# Vergabe-Advisor Frontend (Vue 3 + Vite)

SPA für öffentliche Auftraggeber — Formular + Freigabe-Dashboard


---

## 📋 Projektstruktur

```
src/
├── main.js                 # Vue Router Setup
├── App.vue                # Root Component (Nav + Router)
├── api.service.js         # Backend API Calls (Axios)
├── views/
│   ├── LoginView.vue      # 🔑 Login
│   ├── AdvisorView.vue    # 📝 Vergabe-Formular
│   └── DashboardView.vue  # 📊 Freigabe-Übersicht
├── components/            # (optional: reusable components)
└── styles/                # (optional: global styles)

index.html                 # Entry Point
vite.config.js            # Vite Config
vercel.json               # Vercel Deploy Config
package.json              # Dependencies
```

---

## 🚀 Local Development (iPhone/iPad)

### Option 1: GitHub + Vercel (EMPFOHLEN)

1. **Dateien zu GitHub pushen:**
   ```
   Umbenennen:
   frontend-package.json → package.json
   frontend-vite.config.js → vite.config.js
   frontend-main.js → src/main.js
   frontend-App.vue → src/App.vue
   frontend-LoginView.vue → src/views/LoginView.vue
   frontend-AdvisorView.vue → src/views/AdvisorView.vue
   frontend-DashboardView.vue → src/views/DashboardView.vue
   frontend-api.service.js → src/api.service.js
   frontend-index.html → index.html
   frontend-vercel.json → vercel.json
   ```

2. **Neue Struktur (GitHub):**
   ```
   vergabe-advisor-frontend/
   ├── src/
   │   ├── main.js
   │   ├── App.vue
   │   ├── api.service.js
   │   └── views/
   │       ├── LoginView.vue
   │       ├── AdvisorView.vue
   │       └── DashboardView.vue
   ├── index.html
   ├── vite.config.js
   ├── vercel.json
   ├── package.json
   └── .gitignore
   ```

3. **Zu GitHub pushen:**
   ```bash
   git add .
   git commit -m "Initial Vue 3 frontend setup"
   git push origin main
   ```

4. **Vercel connecten:**
   - https://vercel.com
   - "Import Project"
   - "Git Repository" wählen
   - `vergabe-advisor-frontend` Repo
   - Deploy

---

### Option 2: npm (ohne Laptop)

Nicht möglich auf iPhone/iPad (kein npm/node).

---

## 🔐 Login Test-Nutzer

```
Email: kristian@tempelhof.de
Passwort: (wird noch gesetzt)

Oder andere Test-User:
- vergabestelle@tempelhof.de (Freigeber 1)
- finanzen@tempelhof.de (Freigeber 2)
- admin@tempelhof.de (Admin)
```

---

## 📡 Backend-Integration

**Base URL:** `https://vergabe-advisor-production.up.railway.app/api`

### Endpoints:

```
POST   /auth/login
GET    /vergaben
GET    /vergaben/:id
POST   /vergaben
PUT    /vergaben/:id
POST   /vergaben/:id/submit
POST   /vergaben/:id/approve/:userId
POST   /vergaben/:id/reject/:userId
```

JWT Token wird automatisch hinzugefügt (aus localStorage).

---

## 🎯 Nächste Schritte

1. **Dateien zu GitHub pushen** (Struktur oben)
2. **Vercel Project erstellen**
3. **Testen: https://vergabe-advisor-frontend.vercel.app**

---

## 🛠️ Development Workflow (nach erstem Deploy)

Alle Änderungen:
1. GitHub Web Editor bearbeiten
2. Commit
3. Vercel deployt automatisch

---

## 🎨 Styling

- Tailwind-ähnliche Utility-Klassen (inline CSS)
- Türkis (#06B6D4) als Primary Color
- Responsive Design (mobile-first)

---

## 📱 Features Status

```
✅ Login-Seite
✅ Vergabe-Advisor Formular
✅ Freigabe-Dashboard
✅ API-Integration
✅ JWT Authentication
❌ File Upload (Phase 2)
❌ Notifications (Phase 2)
```

---

## 💡 Troubleshooting

**"Not Found" auf Vercel?**
- Warten 1-2 Minuten nach Deploy
- vercel.json Rewrites prüfen

**API-Fehler?**
- Console (DevTools) öffnen
- Backend URL checken: `https://vergabe-advisor-production.up.railway.app/health`
- JWT Token? (localStorage)

---

**Fragen?** Schreib mir! 🚀
