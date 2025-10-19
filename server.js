const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://sahil:mario77@cluster0.aaiy6sn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'mario_game';
const COLLECTION_NAME = 'players';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

let db;

// Connect to MongoDB
async function connectToMongoDB() {
    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        db = client.db(DB_NAME);
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

// API endpoint to store player name
app.post('/api/player', async (req, res) => {
    try {
        const { name, timestamp } = req.body;
        
        if (!name || name.trim().length < 2) {
            return res.status(400).json({ 
                error: 'Name is required and must be at least 2 characters long' 
            });
        }

        const playerData = {
            name: name.trim(),
            timestamp: timestamp || new Date().toISOString(),
            createdAt: new Date()
        };

        const result = await db.collection(COLLECTION_NAME).insertOne(playerData);
        
        res.json({
            success: true,
            message: 'Player name stored successfully',
            playerId: result.insertedId,
            name: playerData.name
        });
    } catch (error) {
        console.error('Error storing player name:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to store player name'
        });
    }
});

// API endpoint to get all players (for debugging/admin purposes)
app.get('/api/players', async (req, res) => {
    try {
        const players = await db.collection(COLLECTION_NAME)
            .find({})
            .sort({ createdAt: -1 })
            .limit(100)
            .toArray();
        
        res.json({
            success: true,
            players: players
        });
    } catch (error) {
        console.error('Error fetching players:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to fetch players'
        });
    }
});

// API endpoint to store level completion time
app.post('/api/leaderboard', async (req, res) => {
    try {
        const { playerName, completionTime, difficulty, levelType, timestamp } = req.body;
        
        if (!playerName || completionTime === undefined) {
            return res.status(400).json({ 
                error: 'Player name and completion time are required' 
            });
        }

        const leaderboardEntry = {
            playerName: playerName.trim(),
            completionTime: parseFloat(completionTime),
            difficulty: difficulty || 0,
            levelType: levelType || 'Overground',
            timestamp: timestamp || new Date().toISOString(),
            createdAt: new Date()
        };

        const result = await db.collection('leaderboard').insertOne(leaderboardEntry);
        
        res.json({
            success: true,
            message: 'Level completion time stored successfully',
            entryId: result.insertedId,
            data: leaderboardEntry
        });
    } catch (error) {
        console.error('Error storing leaderboard entry:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to store leaderboard entry'
        });
    }
});

// API endpoint to get leaderboard data
app.get('/api/leaderboard', async (req, res) => {
    try {
        const { limit = 50, sortBy = 'completionTime', order = 'asc' } = req.query;
        
        const sortOrder = order === 'desc' ? -1 : 1;
        const sortObj = {};
        sortObj[sortBy] = sortOrder;
        
        const leaderboard = await db.collection('leaderboard')
            .find({})
            .sort(sortObj)
            .limit(parseInt(limit))
            .toArray();
        
        res.json({
            success: true,
            leaderboard: leaderboard,
            count: leaderboard.length
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to fetch leaderboard'
        });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
async function startServer() {
    await connectToMongoDB();
    
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log('Mario game with MongoDB integration is ready!');
    });
}

startServer().catch(console.error);
