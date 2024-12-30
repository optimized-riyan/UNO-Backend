import express from 'express';
import dotenv from 'dotenv';
import { Lobby } from './models/lobby.js';
import { Player } from './models/player.js';
import { WebSocketServer } from 'ws';

dotenv.config();
const app = express();

app.use(express.json());

app.post('/host', (req, res) => {
    const {hostname, playerCount} = req.body;
    if (!hostname || !playerCount) {
        res.status(422).end(`
            please provide:
            {
                hostname: string,
                playerCount: integer
            }
        `);
    } else {
        const roomId = Lobby.createLobby();
        res.status(200).json({roomId});
    }
});

app.post('/join', (req, res) => {
    const {lobbyId} = req.body;
    if (!lobbyId) {
        res.status(422).end(`
            please provide:
            {
                lobbyId: string,
                }    
        `);
        return;
    }

    const lobby = Lobby.lobbies.get(lobbyId);
    if (!lobby) {
        res.status(404).end('lobby not found');
    } else if (lobby.players.length === lobby.maxPlayers) {
        res.status(403).end('lobby is full');
    } else {
        const player = new Player;
        lobby.addPlayer(player);
        res.cookie('playerId', player.playerId).status(204).end();
    }
});

app.listen(process.env.PORT, function() {
    console.log(`Server started on http://localhost:${process.env.PORT}`);
});

const server = new WebSocketServer;
server.on('connection', (socket, req) => {
    
});
