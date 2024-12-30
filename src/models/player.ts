import { Card } from "./card";

export class Player {
    public cards: Card[] = [];
    public playerId: string;

    constructor(playerId: string) {
        this.playerId = playerId;
    }
}
