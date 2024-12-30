import randomstring from 'randomstring';
import { Player } from './player';

export class Lobby {
    public lobbyId: string;
    public players: Player[];
    public nextPlayer?: Player;
    public lobbyState: LobbyState;
    public pickupCount: number;
    public isReversed: boolean;

    constructor(lobbyId: string, players: Player[]) {
        this.lobbyId = lobbyId;
        this.players = players;
        this.lobbyState = LobbyState.WaitingForPlayers;
        this.pickupCount = 0;
        this.isReversed = false;
    }

    public static createLobby(): Lobby {
        return new Lobby(Lobby.roomIdGen(), []);
    }

    private static roomIdGen = (): string => randomstring.generate({length: 6, charset: ['numeric']});
}

export enum LobbyState {
    WaitingForPlayers,
    Running,
    Ended,
    AllPlayersLeft
}