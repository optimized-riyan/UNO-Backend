import express from 'express';
import dotenv from 'dotenv';
import {WebSocketServer} from 'ws';
import bodyParser from 'body-parser';

dotenv.config();
const app = express();

app.use(bodyParser.json());

app.post('/host', (req, res) => {
    const {hostname, playerCount} = req.body;
    if (!hostname || !playerCount) {
        res.writeHead(422);
    } else {
        res.writeHead(204);
    }
});

app.listen(process.env.PORT, function() {
    console.log(`Server started on http://localhost:${process.env.PORT}`);
});
