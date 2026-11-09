# Chess

A browser-based multiplayer chess game built with Express, Socket.IO, EJS, and
`chess.js`. The server validates moves and broadcasts the board state and move
history to connected clients.

## Requirements

- Node.js
- npm

## Setup

From the `backend` directory, install dependencies:

```bash
npm install
```

## Run

Start the server:

```bash
node app.js
```

Open [http://localhost:3000](http://localhost:3000) in a browser. Open another
browser window or tab to join as the second player. Additional connections join
as spectators.

The client loads `chess.js` from jsDelivr, so an internet connection is needed
when loading the game.

## Project structure

```text
backend/
├── app.js          # Express app, chess state, and Socket.IO handlers
├── public/
│   └── script.js   # Browser chessboard and client-side UI
└── views/
    └── index.ejs   # Game page
```

The current game and move history are held in server memory. They reset when
the server restarts, and this project does not currently persist games to a
database.
