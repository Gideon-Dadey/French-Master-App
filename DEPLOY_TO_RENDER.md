# Deploying Backend to Render.com

Follow these exact steps to host your backend in the cloud for free.

## Phase 1: Push Your Code to GitHub
We need to make sure your latest code is on GitHub so Render can see it.

1. I (Antigravity) will commit and push your current changes for you in the next step.
   * *Required Action*: Just say "Yes" when I ask to push the code.

## Phase 2: Create Service on Render
1. Go to [https://dashboard.render.com/](https://dashboard.render.com/) and Log in (you can use your GitHub account).
2. Click the **"New +"** button and select **"Web Service"**.
3. Under "Connect a repository", select **"Build and deploy from a Git repository"**.
4. Find your repo `French-Master-App` and click **"Connect"**.

## Phase 3: Configure the Service
Fill in the form with these EXACT settings:

*   **Name**: `french-master-backend` (or anything you like)
*   **Region**: `Oregon (US West)` (or closest to you)
*   **Branch**: `main`
*   **Root Directory**: `backend` (IMPORTANT: Do not leave this empty!)
*   **Runtime**: `Node`
*   **Build Command**: `npm install`
*   **Start Command**: `node server.js`
*   **Instance Type**: `Free`

## Phase 4: Environment Variables (The Important Part!)
Scroll down to "Environment Variables" and click **"Add Environment Variable"**. You need to add the keys from your backend `.env` file. 

Add these keys (values depend on your setup):

1.  **Key**: `NODE_ENV`
    *   **Value**: `production`
2.  **Key**: `MONGODB_URI`
    *   **Value**: (Your MongoDB Connection String from Atlas. If you don't have this, search "MongoDB Atlas Connect" to get it.)
3.  **Key**: `JWT_SECRET`
    *   **Value**: (Create a random long password, e.g., `mySuperSecretKey123!`)
4.  **Key**: `GEMINI_API_KEY`
    *   **Value**: (Copy this from your local `.env` or `.env.example`)

## Phase 5: Finish
1.  Click **"Create Web Service"**.
2.  Wait for the logs to say `Server running on port...`.
3.  **COPY THE URL** at the top left of the dashboard (it looks like `https://french-master-backend.onrender.com`).

## Phase 6: Tell Me the URL
Paste that URL here in the chat. I will then update your app to use it!
