import randomstring from 'randomstring';
import { Lobby } from './lobby.js';
import { ClientSidePlayer, PlayerConnectionState, ServerEvent } from '../types.js';
import { Card } from './card.js';

export class Player {
    public cards: Card[] = [];
    public playerId: string;
    public index?: number;
    public name: string;
    public lobby: Lobby;
    public socket?: WebSocket;
    public connectionState = PlayerConnectionState.NotYetConnected;
    public static players: Map<string, Player> = new Map;

    constructor(lobby: Lobby, name: string) {
        this.playerId = Player.playerIdGen();
        this.lobby = lobby;
        this.name = name;
    }

    private static playerIdGen(): string {
        return randomstring.generate();
    }

    public sendServerEvent(serverEvent: ServerEvent): void {
        this.socket?.send(JSON.stringify(serverEvent));
    }

    public sendServerEvents(serverEvents: ServerEvent[]): void {
        serverEvents.forEach(ev => this.sendServerEvent(ev));
    }

    public toClientSidePlayer(): ClientSidePlayer {
        return {
            name: this.name,
            cardCount: this.cards.length,
            index: this.index!
        };
    }
}
