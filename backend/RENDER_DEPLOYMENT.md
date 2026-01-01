# Render Backend Deployment Checklist

## 1. Push Code to GitHub
Ensure all recent changes to `server.js` and `package.json` are committed and pushed.

```bash
git add .
git commit -m "chore: prepare backend for render deployment"
git push origin main
```

## 2. Create Render Web Service
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New** -> **Web Service**.
3. Connect your **GitHub Repository** (`ShopKart`).
4. Select the **Root Directory** as `backend` (Important!).

## 3. Configuration
- **Name**: `shopkart-backend` (or similar)
- **Region**: Singapore (or nearest to you)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

## 4. Environment Variables
Go to the **Environment** tab and click **Add Environment Variable**. Add all variables from your local `.env`.

| Key | Value Note |
| :--- | :--- |
| `PORT` | `10000` (or let Render assign it, but setting it is safe) |
| `MONGO_URI` | Copy from local `.env` |
| `JWT_SECRET` | Use a strong secret |
| `GOOGLE_CALLBACK_URL` | `https://<YOUR-RENDER-APP-NAME>.onrender.com/auth/google/callback` |
| `...others...` | Copy keys (Razorpay, OpenAI, Twilio, Email) |

> **Critical**: Update your `GOOGLE_CALLBACK_URL` on Render to match the deployed domain!
> **Also**: Go to [Google Cloud Console](https://console.cloud.google.com/) -> Credentials -> OAuth Client and add this new callback URL to "Authorized redirect URIs".

## 5. Deploy & Verify
Click **Create Web Service**. Wait for the build to finish.

**Verification:**
Once live, visit: `https://<YOUR-APP>.onrender.com/api/health`
You should see: `{"status":"ok","uptime":...}`

## 6. Final Connection
Take your new Render Backend URL (e.g., `https://shopkart-backend.onrender.com`) and update your **Vercel Frontend Project**:
1. Go to Vercel -> Settings -> Environment Variables.
2. Edit `VITE_API_BASE_URL` with the new Render URL.
3. Redeploy Frontend (Deployment -> Redeploy).
