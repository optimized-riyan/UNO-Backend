import randomstring from 'randomstring';
import { Player } from './player.js';
import { Card } from './card.js';

export class Lobby {
    public lobbyId: string;
    public players: Player[];
    public maxPlayers: number;
    public nextPlayer?: Player;
    public lobbyState: LobbyState;
    public pickupCount: number;
    public isReversed: boolean;
    public stack: Card[];

    public static lobbies: Map<string, Lobby> = new Map;

    constructor(lobbyId: string, players: Player[], maxPlayers: number = 2) {
        this.lobbyId = lobbyId;
        this.players = players;
        this.lobbyState = LobbyState.WaitingForPlayers;
        this.pickupCount = 0;
        this.isReversed = false;
        this.maxPlayers = maxPlayers;
        this.stack = [];
    }

    public static createLobby(): string {
        const lobby = new Lobby(Lobby.roomIdGen(), []);
        Lobby.lobbies.set(lobby.lobbyId, lobby);
        return lobby.lobbyId;
    }

    private static roomIdGen = (): string => randomstring.generate({length: 6, charset: ['numeric']});

    public addPlayer(player: Player): void {
        this.players.push(player);
    }

    public checkIsCardValid(card: Card): boolean {
        return true; // TODO: implement card validation
    }

    public pushToStack(player: Player, cardIndex: number) {

    }
}

export enum LobbyState {
    WaitingForPlayers,
    Running,
    Ended,
    AllPlayersLeft
}