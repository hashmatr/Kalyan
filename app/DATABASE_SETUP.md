# Database Setup Guide

## MongoDB Atlas Configuration

Your Kalyan app now uses MongoDB to persist all habit data, progress, punishments, and stats. Follow these steps to set up your database:

### 1. Fix MongoDB Connection

The error you're seeing (`bad auth : Authentication failed`) means your MongoDB credentials are incorrect. Here's how to fix it:

#### Option A: Update Your `.env.local` File

1. Open `e:\Kalyan\app\.env.local`
2. Update the `MONGODB_URI` with correct credentials:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Important**: Replace:
- `<username>` - Your MongoDB Atlas username
- `<password>` - Your MongoDB Atlas password (URL-encoded if it contains special characters)
- `<cluster>` - Your cluster address (e.g., `cluster0.abc123.mongodb.net`)
- `<database>` - Your database name (e.g., `kalyan`)

#### Option B: Create New MongoDB Atlas Database

If you don't have a MongoDB Atlas account:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (Free tier M0 is sufficient)
4. Create a database user:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Set username and password
   - Grant "Read and write to any database" permission
5. Whitelist your IP:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (or add your specific IP)
6. Get connection string:
   - Go to "Database"
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

### 2. How Data Syncing Works

The app now uses a **hybrid approach**:

1. **Local Storage (Fast)**: Data is stored in localStorage for instant access
2. **MongoDB (Persistent)**: Data is automatically synced to MongoDB every 2 seconds after changes
3. **On Load**: When you open the app, it loads data from MongoDB first, then falls back to localStorage

### 3. What Gets Stored in MongoDB

The `UserProgress` model stores:
- ✅ **Habits**: All your daily habits (default + custom)
- ✅ **Progress**: Calendar data showing which days you completed habits
- ✅ **Punishments**: Accountability log when habits are broken
- ✅ **Stats**: Streaks, completion rates, total days tracked
- ✅ **User-specific**: Each user's data is completely separate

### 4. Testing the Database Connection

Once you've updated your `.env.local`:

1. Restart the dev server:
   ```bash
   npm run dev
   ```

2. Check the console for:
   - ✅ `Connected to MongoDB` - Success!
   - ✅ `Successfully synced with database` - Data is saving
   - ✅ `Successfully loaded data from database` - Data is loading

3. If you see errors:
   - Check your MongoDB credentials
   - Verify your IP is whitelisted
   - Ensure your password doesn't contain special characters (or URL-encode them)

### 5. URL Encoding Special Characters

If your MongoDB password contains special characters, you need to URL-encode them:

| Character | Encoded |
|-----------|---------|
| @         | %40     |
| :         | %3A     |
| /         | %2F     |
| ?         | %3F     |
| #         | %23     |
| [         | %5B     |
| ]         | %5D     |

Example:
- Password: `MyP@ss:word!`
- Encoded: `MyP%40ss%3Aword!`

### 6. Verify Data Persistence

To test if data is being saved:

1. Complete a habit
2. Wait 2 seconds (auto-sync delay)
3. Check browser console for "✅ Successfully synced with database"
4. Refresh the page
5. Your progress should still be there!

### 7. Troubleshooting

**Problem**: "MongoDB connection failed"
- **Solution**: Check your `.env.local` file has correct `MONGODB_URI`

**Problem**: "Not authenticated" errors
- **Solution**: Make sure you're logged in and have a valid token

**Problem**: Data not syncing
- **Solution**: Open browser console and check for sync errors

**Problem**: "bad auth : Authentication failed"
- **Solution**: Your MongoDB password is incorrect. Double-check credentials in MongoDB Atlas

## Database Schema

### UserProgress Collection

```typescript
{
  userId: ObjectId,           // Reference to User
  habits: [
    {
      id: string,
      title: string,
      icon: string,
      color: string,
      streak: number,
      completed: boolean,
      lastCompleted: Date,
      isCustom: boolean
    }
  ],
  punishments: [
    {
      id: string,
      date: Date,
      reason: string,
      completed: boolean
    }
  ],
  stats: {
    totalDays: number,
    currentStreak: number,
    longestStreak: number,
    completionRate: number
  },
  calendarData: Map<string, boolean>,  // "2026-01-06" -> true/false
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

- `GET /api/progress` - Fetch user's progress data
- `POST /api/progress` - Save/update user's progress data

Both endpoints require JWT authentication via `Authorization: Bearer <token>` header.

---

**Need Help?** Check the browser console for detailed error messages and sync status.
