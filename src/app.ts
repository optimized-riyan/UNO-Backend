import express from 'express';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import { Lobby } from './models/lobby.js';
import { Player } from './models/player.js';
import cors from 'cors';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true
}));

app.post('/api/host', (req, res) => {
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
        const lobby = Lobby.createLobby();
        const player = new Player(lobby, hostname);
        lobby.addPlayer(player);
        res.status(200).cookie('playerId', player.playerId, {
            sameSite: 'lax'
        }).json({lobbyId: lobby.lobbyId}).end();
    }
});

app.post('/api/join', (req, res) => {
    const {lobbyId, name} = req.body;
    if (!lobbyId || !name) {
        res.status(422).end(`
            please provide:
            {
                lobbyId: string,
                name: string
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
        const player = new Player(lobby, name);
        lobby.addPlayer(player);
        res.cookie('playerId', player.playerId).status(200).json({lobbyId, lobbyCapacity: lobby.maxPlayers}).end();
    }
});

app.listen(process.env.PORT, function() {
    console.log(`Server started on http://localhost:${process.env.PORT}`);
});

const server = new WebSocketServer({port: parseInt(process.env.WSS_PORT!)});
server.on('connection', Lobby.playerConnectionHandler);
