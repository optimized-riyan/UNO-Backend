import {IncomingMessage} from 'http';
import { Player } from './models/player.js';
import { Card } from './models/card.js';

export default function(socket: WebSocket, req: IncomingMessage): void {
    const playerId: string | undefined = (new URLSearchParams(req.headers.cookie ?? '') as any).playerId;
    if (!playerId) {
        socket.close();
        return;
    }
    const player = Player.players.get(playerId);
    if (!player) {
        socket.close();
        return;
    }
    const lobby = player.lobby;

    socket.onmessage = (message: MessageEvent): void => {
        lobby.gameLoop(message, player, sendServerMessage);
    };

    function sendServerMessage(serverMessage: ServerMessage): void {
        socket.send(JSON.stringify(serverMessage));
    }
}


export interface ServerMessage {
    type: ServerMessageType,
    data?: string | PlayersUpdate | StackUpdate,
}

export enum ServerMessageType {
    InvalidAction,
    PlayersUpdate,
    StackUpdate,
}

export interface PlayersUpdate {
    updates: PlayerUpdate[],
}

export interface PlayerUpdate {
    playerIndex: number,
    cardCount: number,
}

export interface StackUpdate {
    topCard: Card,
}

export interface ClientMessage {
    type: ClientMessageType,
    data: ChosenCard,
}

export enum ClientMessageType {
    ChosenCard,
}

export interface ChosenCard {
    cardIndex: number,
}