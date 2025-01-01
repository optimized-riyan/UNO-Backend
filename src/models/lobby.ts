import randomstring from 'randomstring';
import { Player } from './player.js';
import { Card, CardColor, CardValue } from './card.js';
import { ChosenCard, ClientMessage, ClientMessageType, ServerMessage, ServerMessageType } from '../websocket.js';

export class Lobby {
    public lobbyId: string;
    public players: Player[];
    public maxPlayers: number;
    public currentPlayerIndex: number = 0;
    public lobbyState: LobbyState = LobbyState.WaitingForPlayers;
    public pickupCount: number = 0;
    public isReversed: boolean = false;
    public isSkipNext: boolean = false;
    public stack: Card[] = [];

    public static lobbies: Map<string, Lobby> = new Map;

    constructor(lobbyId: string, players: Player[], maxPlayers: number = 2) {
        this.lobbyId = lobbyId;
        this.players = players;
        this.maxPlayers = maxPlayers;
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
                } else if (this.players[this.currentPlayerIndex] as Player !== player) {
                    sendInvalidActionMessage('it is not your turn yet');
                } else if (cardIndex >= player.cards.length) {
                    sendInvalidActionMessage('card index out of range');
                } else if (!this.checkIsCardValid(player.cards[cardIndex] as Card)) {
                    sendInvalidActionMessage('invalid move');
                } else {
                    this.pushToStack(player, cardIndex);
                    this.chooseNextPlayer();
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
        switch ((player.cards[cardIndex] as Card).value) {
            case (CardValue.PlusTwo):
                this.pickupCount += 2;
                break;
            case (CardValue.PlusFour):
                this.pickupCount += 4;
                break;
            case (CardValue.Reverse):
                this.isReversed = !this.isReversed;
                break;
            case (CardValue.Skip):
                this.isSkipNext = true;
                break;
            default:
                throw Error('invalid card');
        }
    }

    public chooseNextPlayer(): void {
        if (this.pickupCount > 0) {
            const nextPlayer = this.nextPlayer(this.currentPlayerIndex);
            if (!nextPlayer.checkPlayerHasCardWithValue(CardValue.PlusTwo) && !nextPlayer.checkPlayerHasCardWithValue(CardValue.PlusFour)) {

            }
        }
    }

    private nextPlayer(currIndex: number): Player {
        let nextIndex = (currIndex + 1) % this.maxPlayers;
        let counter = 0;
        while ((this.players[nextIndex] as Player).cards.length === 0 && counter < this.maxPlayers) nextIndex++;
        if (counter === this.maxPlayers) throw 'invalid server state';
        return this.players[nextIndex] as Player;
    }
}

export enum LobbyState {
    WaitingForPlayers,
    Running,
    Ended,
    AllPlayersLeft
}