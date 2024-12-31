import randomstring from 'randomstring';
import { Player } from './player.js';
import { Card } from './card.js';
import { ChosenCard, ClientMessage, ClientMessageType, ServerMessage, ServerMessageType } from '../websocket.js';

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

    public gameLoop(message: MessageEvent, player: Player, sendServerMessage: (message: ServerMessage) => void) {
        if (this.lobbyState !== LobbyState.Running) {
            sendInvalidActionMessage('game not yet running');
            return;
        }

        const clientMessage = message.data as ClientMessage;
        switch (clientMessage.type) {
            case ClientMessageType.ChosenCard:
                const cardIndex = (clientMessage.data as ChosenCard).cardIndex;
                if (!cardIndex) {
                    sendInvalidActionMessage('card index not provided');
                } else if (this.nextPlayer !== player) {
                    sendInvalidActionMessage('it is not your turn yet');
                } else if (cardIndex >= player.cards.length) {
                    sendInvalidActionMessage('card index out of range');
                } else if (!this.checkIsCardValid(player.cards[cardIndex] as Card)) {
                    sendInvalidActionMessage('invalid move');
                } else {
                    this.pushToStack(player, cardIndex);
                }
                break;
            default:
                sendInvalidActionMessage('unknown action');
                break;
        }

        function sendInvalidActionMessage(message?: string): void {
            sendServerMessage({
                type: ServerMessageType.InvalidAction,
                data: message,
            });
        }
    }

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