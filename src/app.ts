import express from 'express';
import dotenv from 'dotenv';
import { createLobby } from './lobby.js';

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
        const roomId = createLobby();
        res.status(200).json({roomId});
    }
});

app.listen(process.env.PORT, function() {
    console.log(`Server started on http://localhost:${process.env.PORT}`);
});
