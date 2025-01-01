import { Card, CardColor, CardValue } from "./card.js";
import randomstring from 'randomstring';
import { Lobby } from "./lobby.js";
import { ServerMessage, ServerMessageType } from "../websocket.js";

export class Player {
    public cards: Card[] = [];
    public playerId: string;
    public lobby: Lobby;
    public socket?: WebSocket;
    public static players: Map<string, Player> = new Map;

    constructor(lobby: Lobby) {
        this.playerId = Player.playerIdGen();
        this.lobby = lobby;
    }

    private static playerIdGen(): string {
        return randomstring.generate();
    }

    public checkPlayerHasCardWithColor(color: CardColor): boolean {
        return this.cards.some(card => card.color === color);
    }
    
    public checkPlayerHasCardWithValue(value: CardValue): boolean {
        return this.cards.some(card => card.value === value);
    }
    
    public checkPlayerHasCard(card: Card): boolean {
        return this.cards.includes(card);
    }

    public sendServerMessage(serverMessage: ServerMessage): void {
        this.socket?.send(JSON.stringify(serverMessage));
    }

    public sendInvalidActionMessage(message?: string): void {
        this.sendServerMessage({
            type: ServerMessageType.InvalidAction,
            data: message,
        });
    }
}
