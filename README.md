# EV Wireless Charging — Website

React (Vite) web app for the Wireless EV Charging System. Same backend as the mobile app, same dark theme. One site, role-based: regular users charge and pay, admins see live stations, sessions, and stats.

## Local setup

```
npm install
npm run dev
```

Before running, open `src/api/client.js` and set `RAZORPAY_KEY_ID` to your real **test** Key ID from
dashboard.razorpay.com → Settings → API Keys (Test Mode toggle on, top-right).

## Deploying to Render (Static Site)

1. Push this folder to a new GitHub repo (same process as the backend — create repo, upload files, or `git push`)
2. Go to dashboard.render.com → **New** → **Static Site**
3. Connect your GitHub repo
4. Set:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
5. Click **Create Static Site**

Render will auto-detect `render.yaml` if it's in the repo root, which already has these settings filled in.

Because this is a real deployed site (not a sandboxed preview), the Razorpay checkout script loads normally and the full test payment flow works exactly like it would in production.

## Testing a payment

Click "Pay & Start Charging" — Razorpay's checkout popup opens. In test mode, use:
- **Card:** 4111 1111 1111 1111
- **Expiry:** any future date
- **CVV:** any 3 digits

No real money moves.

## How role-based access works

- After login, the backend returns `user.role` (`"user"` or `"admin"`)
- Regular users see: Home (pick amount, pay) → Charging (live countdown) → History
- Admins see: Stations, Active Sessions, Stats
- To make yourself admin:
  ```sql
  UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
  ```

## Still to do

- Add a `GET /sessions/mine` backend route so History shows only the logged-in user's sessions
- Real station picker (currently hardcoded to station #1)
- Add your deployed site's URL to the backend's CORS settings if you lock it down later
