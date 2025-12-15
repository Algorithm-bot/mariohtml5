# Mario HTML5 Game with MongoDB Integration

A Mario-style HTML5 game with player name collection and MongoDB storage.

## Features

- 🎮 Classic Mario-style gameplay
- 📝 Player name input popup before starting
- 🗄️ MongoDB integration for storing player names
- 🎨 Modern, responsive UI
- ⚡ Real-time code execution for controlling Mario

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB instance)

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. The MongoDB connection string is already configured in `server.js`:
   ```
   mongodb+srv://sahil:mario77@cluster0.aaiy6sn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```

## Running the Game

1. Start the server:
   ```bash
   npm start
   ```

2. Open your browser and go to:
   ```
   http://localhost:3005
   ```

3. The game will load and show a name input popup
4. Enter your name and click "Start Game"
5. Your name will be stored in MongoDB and displayed on the title screen
6. Press 'S' to start playing!

## Development

For development with auto-restart:
```bash
npm run dev
```

## Game Controls

- **S** - Start game from title screen
- **Arrow Keys** - Move Mario
- **Space** - Jump
- **Code Editor** - Write JavaScript commands to control Mario

## API Endpoints

- `POST /api/player` - Store player name
- `GET /api/players` - Get all players (for debugging)

## Project Structure

```
├── code/                 # Game logic files
├── Enjine/              # Game engine
├── images/              # Game assets
├── sounds/              # Audio files
├── server.js            # Express server with MongoDB
├── index.html           # Main game page
└── package.json         # Dependencies
```

## MongoDB Schema

Player documents are stored with the following structure:
```json
{
  "_id": "ObjectId",
  "name": "Player Name",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## Troubleshooting

- Make sure MongoDB connection string is correct
- Check that all dependencies are installed
- Ensure port 3005 is available
- Check browser console for any JavaScript errors

## License

MIT License
