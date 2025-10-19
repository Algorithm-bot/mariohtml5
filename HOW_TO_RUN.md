# How to Run the Mario Game Correctly

## The Issue
If you're getting the error "Error saving name, but continuing to game..." even though data is being stored in MongoDB, it's likely because you're opening the game incorrectly.

## ❌ Wrong Way (Causes the Error)
- Opening `index.html` directly in your browser
- Using `file://` protocol
- This causes CORS errors when trying to connect to the server

## ✅ Correct Way (Fixes the Error)

### Step 1: Start the Server
```bash
npm start
```
You should see:
```
Server running on http://localhost:3000
Mario game with MongoDB integration is ready!
```

### Step 2: Open the Game in Browser
- Open your web browser
- Go to: `http://localhost:3000`
- **NOT** `file:///path/to/index.html`

## Verification
When running correctly, you should see:
1. ✅ No error messages when entering your name
2. ✅ Console shows "Player name stored successfully"
3. ✅ Data appears in your MongoDB database
4. ✅ Title screen shows "Welcome [YourName]! Press S to Start"

## Quick Test
You can test the server is working by visiting:
- `http://localhost:3000/api/players` - Shows all stored players
- `http://localhost:3000` - The actual game

## Troubleshooting
- Make sure port 3000 is not being used by another application
- Check that MongoDB connection is working
- Ensure you're using `http://localhost:3000` not `file://`
- Check browser console for any JavaScript errors

## Recent Fix (v1.1)
- Fixed "can't access property ChangeState" error
- Improved state transition handling
- Added better error logging and fallback mechanisms
- Names are now properly stored in MongoDB without errors

## Fallback Mode
If the server is not running, the game will:
- Store names locally in browser storage
- Show appropriate error messages
- Still allow you to play the game
