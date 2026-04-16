# CancerCare

Ce README couvre l'installation, la configuration et l'exécution des deux parties du projet : le backend (Node/Express + MongoDB) et le frontend (Angular).

---

## Aperçu

- Backend : `cancer-care-backend/` — API REST, authentification, chatbot, RAG, OCR (optionnel).
- Frontend : `cancer-care-frontend/` — application Angular (UI patient/doctor/admin).

---

## Prérequis

- Node.js (>=18) et npm
- MongoDB (local) ou Docker ou MongoDB Atlas
- (Optionnel) Docker
- (Optionnel) MongoDB Compass (GUI)

---

## Configuration générale

Créez un fichier `.env` dans `cancer-care-backend/` (ou copiez `.env.example` si fourni) et définissez au minimum :

```
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/cancercare
JWT_SECRET=replace_with_secure_secret
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:4200
GROQ_API_KEY=your_groq_api_key_here
```

- `GROQ_API_KEY` : nécessaire pour interroger l'API Groq. Sans clé, le backend renvoie des réponses mock pour le chatbot.

---

## Backend — Installation & exécution

1. Ouvrez un terminal et placez‑vous dans le dossier backend :

```bash
cd cancer-care-backend
npm install
```

2. Démarrer en mode développement (nodemon) :

```bash
npm run dev
```

ou lancer directement :

```bash
node src/server.js
```

3. Vérifier la santé :

```bash
curl http://localhost:3000/health
# ou PowerShell
Invoke-WebRequest -Uri http://localhost:3000/health -UseBasicParsing
```

4. Créer / vérifier l'administrateur :

```bash
node src/create-admin.js
```

Le script affiche l'email et le mot de passe configuré (s'il crée l'utilisateur).

---

## Frontend — Installation & exécution

1. Ouvrez un terminal et placez‑vous dans le dossier frontend :

```bash
cd cancer-care-frontend
npm install
```

2. Lancer l'application Angular en développement :

```bash
npm start
# ou selon scripts : ng serve
```

3. L'interface sera disponible par défaut sur `http://localhost:4200`.

---

## Options si pas de MongoDB local

- Installer MongoDB Community (Windows MSI) et démarrer le service, ou lancer `mongod` manuellement :

```powershell
mkdir C:\data\db
mongod --dbpath C:\data\db
```

- Lancer MongoDB avec Docker :

```bash
docker run -d -p 27017:27017 --name mongo -v mongo-data:/data/db mongo:6.0
```

- Utiliser MongoDB Atlas : remplacer `MONGODB_URI` par la chaîne fournie par Atlas.

---

## Erreurs courantes & dépannage

- `ECONNREFUSED 127.0.0.1:27017` : MongoDB n'est pas démarré localement. Démarrez `mongod` ou utilisez Docker/Atlas.

- `EADDRINUSE: port 3000` : identifiez et terminez le processus qui écoute sur 3000 :

```powershell
netstat -ano | findstr :3000
taskkill /F /PID <PID>
```

- 401 Unauthorized sur `/api/auth/login` :
  - Vérifiez que l'utilisateur existe et le mot de passe.
  - Lancez `node src/create-admin.js` pour créer/inspecter l'admin.

- Sharp / OCR (`ERR_DLOPEN_FAILED`) sur Windows :

```bash
npm install --include=optional sharp
# ou
npm install --os=win32 --cpu=x64 sharp
```

- Problèmes de CORS : vérifiez l'origine dans `src/server.js` et la variable `FRONTEND_URL`.

---

## Chatbot (Groq)

- Le service est implémenté dans `cancer-care-backend/src/services/groqservice.js`.
- Définissez `GROQ_API_KEY` pour appeler Groq. Sans clé, les réponses mock sont utilisées.
- Test rapide :

```bash
curl -X POST http://localhost:3000/api/chatbot/message -H "Content-Type: application/json" -d '{"message":"Bonjour"}'
```

---

## Conseils pratiques

- Ajouter un fichier `cancer-care-backend/.env.example` pour faciliter la configuration des contributeurs.
- Si vous souhaitez lancer l'ensemble (MongoDB + backend) rapidement, je peux ajouter un `docker-compose.yml` pour faciliter le démarrage.

---

Si vous voulez, je peux maintenant :
- ajouter un `.env.example`,
- harmoniser le message/mot de passe dans `src/create-admin.js`,
- ou créer un `docker-compose.yml` pour MongoDB + backend.

Dites‑moi quelle option vous préférez.