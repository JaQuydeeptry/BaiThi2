# Music Share App

Small example app for uploading and sharing MP3 files. This repository contains two parts:

- server/  — Express backend that uploads MP3 files to Cloudinary and stores metadata in MongoDB
- client/  — React frontend (Dropzone + simple UI)

---

## Quick setup

1) Server

 - Copy `server/.env.example` to `server/.env` and fill in your Cloudinary + MongoDB credentials.
 - From the `server` folder, install and start:

```powershell
cd server
npm install
npm start
```

The server listens on `PORT` or `5000` by default and exposes these endpoints:

- POST /api/upload  — accepts `file` (mp3) multipart form
- GET /api/files/:id — get metadata for uploaded file

2) Client

 - From the `client` folder:

```powershell
cd client
npm install
# Tailwind dev deps (if you don't have them yet)
npm install -D tailwindcss postcss autoprefixer

# start dev
npm start
```

Note: `client/src/App.js` currently sets `API_URL` to `http://localhost:5000`. Change that to your deployed server URL when you deploy the backend (e.g. Render/Heroku).

---

Security note
 - Do NOT commit your `.env` files — use `server/.env` locally and keep real secrets out of source control.
