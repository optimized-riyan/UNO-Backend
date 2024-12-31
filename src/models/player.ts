import { Card } from "./card.js";
import randomstring from 'randomstring';
import { Lobby } from "./lobby.js";

export class Player {
    public cards: Card[] = [];
    public playerId: string;
    public lobby: Lobby;
    public static players: Map<string, Player> = new Map;

    constructor(lobby: Lobby) {
        this.playerId = Player.playerIdGen();
        this.lobby = lobby;
    }

    private static playerIdGen(): string {
        return randomstring.generate();
    }
}
