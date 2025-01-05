import randomstring from 'randomstring';
import { IncomingMessage } from 'http';
import { CardColor, CardCountUpdate, CardsUpdate, CardValidity, CardValue, ClientAction, ClientActionData, ClientActionType, DirectionUpdate, LobbyState, PlayerConnected, PlayerOut, PlayerTurnUpdate, ServerEvent, ServerEventType, StackTopUpdate, SubmitCard } from "../types.js";
import { Card } from "./card.js";
import { Player } from "./player.js";

export class Lobby {
    public lobbyId: string;
    public players: Player[];
    public maxPlayers: number;
    public activePlayers: number = 0; 
    public currentPlayerIndex: number = 0;
    public lobbyState: LobbyState = LobbyState.WaitingForPlayers;
    public pickupCount: number = 0;
    public isReversed: boolean = false;
    public skipNext: boolean = false;
    public stack: Card[] = [];
    public stackTop?: Card;
    public stackColor?: CardColor;
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

    public static playerConnectionHandler(socket: WebSocket, req: IncomingMessage): void {
        const playerId: string | undefined = (new URLSearchParams(req.headers.cookie ?? '') as any).playerId;
        if (!playerId) {
            socket.close();
            return;
        }
        const player = Player.players.get(playerId);
        if (!player) {
            socket.close();
            return;
        }
        player.socket = socket;
        const lobby = player.lobby;

        lobby.onPlayerConnected(player);
    
        socket.onmessage = (message: MessageEvent): void => {
            lobby.gameLoop(message, player);
        };
    }

    public addPlayer(player: Player): void {
        this.players.push(player);
        player.index = this.players.length - 1;
    }

    private onPlayerConnected(player: Player): void {
        this.giveCards(10, player.cards);
        this.sendServerEventComplementary(player, {
            type: ServerEventType.PlayerConnected,
            data: {
                playerIndex: player.index,
                playerName: player.name,
                cardCount: player.cards.length,
            } as PlayerConnected
        });

        player.sendServerEvent({
            type: ServerEventType.CardsUpdate,
            data: {
                cards: player.cards,
            } as CardsUpdate
        });
        player.sendServerEvent({
            type: ServerEventType.DirectionUpdate,
            data: {
                isReversed: false,
            } as DirectionUpdate
        });
        this.players.forEach(p => {
            if (p !== player) {
                player.sendServerEvent({
                    type: ServerEventType.CardCountUpdate,
                    data: {
                        playerIndex: p.index,
                        count: p.cards.length,
                    } as CardCountUpdate
                });
            }
        });

        if (++this.activePlayers === this.maxPlayers) this.beginGame();
    }

    private beginGame(): void {
        while (this.stack.length === 0
            || (this.stack[this.stack.length - 1] as Card).value === CardValue.PlusTwo
            || (this.stack[this.stack.length - 1] as Card).value === CardValue.PlusFour
            || (this.stack[this.stack.length - 1] as Card).value === CardValue.Reverse
            || (this.stack[this.stack.length - 1] as Card).value === CardValue.Skip
            || (this.stack[this.stack.length - 1] as Card).value === CardValue.ColorChange
        ) {
            this.giveCards(1, this.stack);
        }
        this.stackTop = this.stack[this.stack.length - 1];
        this.stackColor = this.stackTop?.color;
        this.sendServerEventToAll({
            type: ServerEventType.GameStarted,
        });
        this.sendServerEventToAll({
            type: ServerEventType.StackTopUpdate,
            data: {
                card: this.stackTop,
            } as StackTopUpdate
        });
        this.sendServerEventToAll({
            type: ServerEventType.PlayerTurnUpdate,
            data: {
                currentPlayerIndex: 0,
            } as PlayerTurnUpdate
        });
        this.lobbyState = LobbyState.Running;
    }

    private gameLoop(message: MessageEvent, player: Player) {
        const clientAction = message.data as ClientAction;
        switch (clientAction.type) {
            case ClientActionType.SubmitCard:
                const {cardIndex} = clientAction.data as SubmitCard;
                const card = player.cards[cardIndex] as Card;
                const cardIsValid = this.checkIsCardValid(card);

                player.sendServerEvent({
                    type: ServerEventType.CardValidity,
                    data: {
                        isValid: cardIsValid
                    } as CardValidity
                });
                if (!cardIsValid) break;

                const removed = player.cards.splice(cardIndex, 1);
                this.stack.push(removed[0] as Card);
                this.stackTop = this.stack[this.stack.length - 1] as Card;
                this.stackColor = this.stackTop.color;
                switch (card.value) {
                    case CardValue.PlusTwo:
                        this.pickupCount += 2;
                        break;
                    case CardValue.PlusFour:
                        this.pickupCount += 4;
                        break;
                    case CardValue.Reverse:
                        this.isReversed = !this.isReversed;
                        this.sendServerEventToAll({
                            type: ServerEventType.DirectionUpdate,
                            data: {isReversed: this.isReversed} as DirectionUpdate
                        });
                        break;
                    case CardValue.Skip:
                        this.skipNext = true;
                        break;
                    case CardValue.ColorChange:
                        player.sendServerEvent({type: ServerEventType.ColorChoiceRequired});
                        break;
                    default:
                        break;
                }
                if (player.cards.length === 0) {
                    this.activePlayers--;
                    this.sendServerEventToAll({
                        type: ServerEventType.PlayerOut,
                        data: {
                            playerIndex: player.index
                        } as PlayerOut
                    });
                }
                break;
        }
    }

    private checkIsCardValid(card: Card): boolean {
        return true; // TODO: implement card validation
    }

    private giveCards(count: number, cardsRef: Card[]): void {
        const poppedCards = [];
        for (let i = 0; i < count; i++) {
            poppedCards.push(this.deck.pop() as Card);
        }
        const length = poppedCards.length;
        for (let i = 0; i < length; i++) cardsRef.push(poppedCards[i] as Card);
    }

    private sendServerEventComplementary(player: Player, serverEvent: ServerEvent): void {
        this.players.forEach(p => {
            if (p !== player) p.sendServerEvent(serverEvent);
        });
    }

    private sendServerEventToAll(serverEvent: ServerEvent): void {
        this.players.forEach(p => {
            p.sendServerEvent(serverEvent);
        });
    }
}
