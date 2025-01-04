import randomstring from 'randomstring';
import { LobbyState } from "../types.js";
import { Card } from "./card.js";
import { Player } from "./player.js";

export class Lobby {
    public lobbyId: string;
    public players: Player[];
    public maxPlayers: number;
    public currentPlayerIndex: number = 0;
    public lobbyState: LobbyState = LobbyState.WaitingForPlayers;
    public pickupCount: number = 0;
    public isReversed: boolean = false;
    public skipNext: boolean = false;
    public stack: Card[] = [];
    public stackTop?: Card;
    public deck: Card[];

    public static lobbies: Map<string, Lobby> = new Map;

    constructor(lobbyId: string, players: Player[], maxPlayers: number = 2, deckCount: number = 2) {
        this.lobbyId = lobbyId;
        this.players = players;
        this.maxPlayers = maxPlayers;
        this.deck = Card.deckFactory(deckCount);
    }

    public static createLobby(): string {
        const lobby = new Lobby(Lobby.roomIdGen(), []);
        Lobby.lobbies.set(lobby.lobbyId, lobby);
        return lobby.lobbyId;
    }

    private static roomIdGen = (): string => randomstring.generate({length: 6, charset: ['numeric']});

    public gameLoop(message: MessageEvent, player: Player) {
    }

    public addPlayer(player: Player): void {
        this.players.push(player);
    }

    public checkIsCardValid(card: Card): boolean {
        return true; // TODO: implement card validation
    }

    private giveCards(count: number, player: Player): void {
        const poppedCards = [];
        for (let i = 0; i < count; i++) {
            poppedCards.push(this.deck.pop() as Card);
        }
        const length = poppedCards.length;
        for (let i = 0; i < length; i++) player.cards.push(poppedCards[i] as Card);
    }
}
