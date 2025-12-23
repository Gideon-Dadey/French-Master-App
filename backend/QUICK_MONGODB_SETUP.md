# 🚀 Quick MongoDB Setup (5 Minutes)

## Easiest Method: MongoDB Atlas (Cloud)

### Step 1: Sign Up (2 min)
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with email
3. Verify email

### Step 2: Create Free Cluster (1 min)
1. Click "Build a Database"
2. Choose **FREE** (M0) tier
3. Select region (choose closest to you)
4. Click "Create"

### Step 3: Create Database User (1 min)
1. Go to "Database Access" (left sidebar)
2. Click "Add New Database User"
3. Authentication: Password
4. Username: `frenchmaster`
5. Password: Create a strong password (save it!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### Step 4: Whitelist IP (30 sec)
1. Go to "Network Access" (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### Step 5: Get Connection String (30 sec)
1. Go to "Database" (left sidebar)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string

It looks like:
```
mongodb+srv://frenchmaster:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### Step 6: Configure Backend (30 sec)
1. Open `backend/.env` file
2. Replace the MONGODB_URI line with:
   ```env
   MONGODB_URI=mongodb+srv://frenchmaster:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/frenchmaster?retryWrites=true&w=majority
   ```
   Replace:
   - `YOUR_PASSWORD` with the password you created
   - `cluster0.xxxxx` with your actual cluster name
   - Add `/frenchmaster` before the `?` to specify database name

### Step 7: Test Connection
```bash
cd backend
npm run dev
```

You should see:
```
MongoDB Connected: cluster0.xxxxx.mongodb.net
Server running on port 5000
```

✅ **Done!** MongoDB is now connected.

---

## Alternative: Local MongoDB

### Windows
1. Download: https://www.mongodb.com/try/download/community
2. Install MongoDB
3. MongoDB starts automatically as service
4. Use in `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/frenchmaster
   ```

### Using Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo:6
```

Then use:
```env
MONGODB_URI=mongodb://localhost:27017/frenchmaster
```

---

## After Connection

### Seed Sample Data
```bash
cd backend
node scripts/seed.js
```

### Start Backend
```bash
npm run dev
```

### Test
Open browser: http://localhost:5000/health

---

## Need Help?

- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
- Connection Issues: See `TROUBLESHOOTING.md`

