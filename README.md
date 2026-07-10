# Prep Deck (MongoDB + Node version)

Two parts:
- `server/` — Node/Express API + MongoDB (your real backend)
- `client/` — React + Vite frontend (talks to the API, never touches MongoDB directly)

## 0. Rotate your MongoDB password first

If any connection string for this database has ever been shared, pasted in a chat,
committed to a repo, or shown on a screen — treat it as exposed. Before anything else:
1. MongoDB Atlas → **Database Access**
2. Find your database user → **Edit Password** → generate a new one
3. Use the *new* password everywhere below — never an old one

## 1. Backend setup

```
cd server
npm install
cp .env.example .env
```

Open `.env` and fill in:
- `MONGODB_URI` — your connection string, but with your **new** password, and add a database name before the `?`, e.g.:
  `mongodb+srv://your_username:YOUR_NEW_PASSWORD@your-cluster.mongodb.net/prepdeck?appName=Cluster1`
- `JWT_SECRET` — generate one by running: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- `PORT` — leave as 4000 unless it conflicts with something
- `CLIENT_ORIGIN` — leave as `http://localhost:5173` while testing locally

This `.env` file is the **only** place your real credentials ever live. It's already in
`.gitignore`, so it never gets committed, and it never gets sent to the browser — the
frontend only ever talks to your own API, never to MongoDB directly.

Run it:
```
npm run dev
```
You should see `Connected to MongoDB` and `Prep Deck server running on port 4000`.

## 2. Frontend setup

In a second terminal:
```
cd client
npm install
npm run dev
```
Open the URL it prints (usually `http://localhost:5173`). Create an account with any
email/password — this is a real account stored (hashed, never in plain text) in your
own MongoDB database.

## 3. How your data is protected

- Passwords are hashed with bcrypt before they ever touch the database — even you
  can't see them again, only verify them.
- Every API request (except login/register) requires a login token. The server checks
  it on every single request and only ever returns *your* data, never anyone else's.
- Screenshots are stored in MongoDB itself via GridFS (MongoDB's built-in file storage),
  capped at 4.5MB per image, and are only ever served back to the account that uploaded them.

## 4. Deploying for real (so it works from any device, forever)

**Backend** — deploy `server/` to a host that runs Node continuously. Free options:
Render, Railway, or Fly.io. In all of them, the flow is roughly:
1. Push this project to a GitHub repo (the `.gitignore` already keeps `.env` out of it)
2. Connect the repo on your chosen host
3. Set `MONGODB_URI`, `JWT_SECRET`, `PORT`, and `CLIENT_ORIGIN` as **environment variables**
   in that host's dashboard — not in code. This is the deployed equivalent of your local `.env`.
4. Deploy — you'll get a live URL like `https://prep-deck-api.onrender.com`

**Frontend** — deploy `client/` to Vercel or Netlify (both have generous free tiers for this):
1. Set the environment variable `VITE_API_URL` to your live backend URL from above
2. Deploy — you'll get a live URL like `https://prep-deck.vercel.app`

Once both are live, open your frontend URL from any device, log in, and everything
you saved during local testing will already be there — it's all sitting in your
MongoDB Atlas database, not in any particular browser.

## Notes on reminders

Same as before: reminders fire via the browser's Notification API while the tab is
open, checked every 20 seconds. True "buzzes my phone even when closed" reminders
need push notifications plus a scheduled job on the server — happy to build that
as a next step if you want it.
