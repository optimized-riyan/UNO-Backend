import { Card } from "./card.js";
import randomstring from 'randomstring';

export class Player {
    public cards: Card[] = [];
    public playerId: string;
    public static players: Map<string, Player> = new Map;

    constructor() {
        this.playerId = Player.playerIdGen();
    }

    private static playerIdGen(): string {
        return randomstring.generate();
    }
}
