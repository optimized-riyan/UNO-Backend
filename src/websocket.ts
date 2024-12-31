import {IncomingMessage} from 'http';
import { Player } from './models/player.js';

export default function(socket: WebSocket, req: IncomingMessage): void {
    const playerId: string | undefined = (new URLSearchParams(req.headers.cookie ?? '') as any).playerId;
    if (!playerId) {
        socket.close();
        return;
    }
    const player = Player.players.get(playerId);
}