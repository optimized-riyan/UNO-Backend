import randomstring from 'randomstring';
import { IncomingMessage } from 'http';
import cookie from 'cookie';
import { CardColor, CardCountUpdate, CardsUpdate, CardValidity, CardValue, ClientAction, ClientActionType, CSPlayersSync, DirectionUpdate, LobbyState, PickColor, PlayerConnectionState, PlayerIndexSync, PlayerOut, PlayerSkipped, PlayerTurnUpdate, ServerEvent, ServerEventType, StackColorUpdate, StackTopUpdate, SubmitCard } from "../types.js";
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
    private awaitingColorChoice: boolean = false;

    public static lobbies: Map<string, Lobby> = new Map;

    constructor(lobbyId: string, players: Player[], maxPlayers: number, deckCount: number = 2) {
        this.lobbyId = lobbyId;
        this.players = players;
        this.maxPlayers = maxPlayers;
        this.deck = Card.deckFactory(deckCount);
    }

    public static createLobby(maxPlayers: number = 2): Lobby {
        const lobby = new Lobby(Lobby.roomIdGen(), [], maxPlayers);
        Lobby.lobbies.set(lobby.lobbyId, lobby);
        return lobby;
    }

    private static roomIdGen = (): string => randomstring.generate({length: 6, charset: ['numeric']});

    public static playerConnectionHandler(socket: WebSocket, req: IncomingMessage): void {
        const playerId: string | undefined = (cookie.parse(req.headers.cookie!) as any).playerId;
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
            lobby.gameLoop(JSON.parse(message.data) as ClientAction, player);
        };

        socket.onclose = () => lobby.onPlayerDisconnected(player);
    }

    public addPlayer(player: Player): void {
        this.players.push(player);
        Player.players.set(player.playerId, player);
        player.index = this.players.length - 1;
    }

    private onPlayerConnected(player: Player): void {
        if (player.connectionState === PlayerConnectionState.NotYetConnected) {
            player.connectionState = PlayerConnectionState.Connected;
            this.giveCards(10, player.cards);
            this.activePlayers++;
        } else if (player.connectionState === PlayerConnectionState.Disconnected) {
            player.connectionState = PlayerConnectionState.Connected;
        }
        player.sendServerEvents([
            {
                type: ServerEventType.PlayerIndexSync,
                data: {
                    playerIndex: player.index!
                } as PlayerIndexSync
            },
            {
                type: ServerEventType.CardsUpdate,
                data: {
                    cards: player.cards
                } as CardsUpdate
            }
        ]);
        if (this.activePlayers === this.maxPlayers && this.lobbyState === LobbyState.WaitingForPlayers) this.beginGame();
    }

    private onPlayerDisconnected(player: Player): void {
        player.connectionState = PlayerConnectionState.Disconnected;
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
        this.stackTop = this.stack[this.stack.length - 1]!;
        this.stackColor = this.stackTop.color;
        this.sendServerEventsToAll([
            {
                type: ServerEventType.CSPlayersSync,
                data: {
                    players: this.players.map(player => player.toClientSidePlayer()),
                } as CSPlayersSync
            },
            {
                type: ServerEventType.GameStarted,
            },
            {
                type: ServerEventType.StackTopUpdate,
                data: {
                    card: this.stackTop
                } as StackTopUpdate
            },
            {
                type: ServerEventType.PlayerTurnUpdate,
                data: {
                    currentPlayerIndex: 0
                } as PlayerTurnUpdate
            },
            {
                type: ServerEventType.DirectionUpdate,
                data: {
                    isReversed: this.isReversed
                } as DirectionUpdate
            }
        ]);
        this.lobbyState = LobbyState.Running;
    }

    private gameLoop(clientAction: ClientAction, player: Player) {
        if (this.lobbyState !== LobbyState.Running || player.index! !== this.currentPlayerIndex) {
            player.sendServerEvent({
                type: ServerEventType.InvalidAction,
                data: this.lobbyState !== LobbyState.Running ? 'Game hasn\'t started yet!' : 'It isn\'t your turn yet!'
            });
            return;
        }

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
                if (!cardIsValid) return;

                const removed = player.cards.splice(cardIndex, 1);
                this.stack.push(removed[0]!);
                this.stackTop = this.stack[this.stack.length - 1]!;
                this.stackColor = this.stackTop.color;

                player.sendServerEvent({
                    type: ServerEventType.CardsUpdate,
                    data: {cards: player.cards} as CardsUpdate
                });
                this.sendServerEventsToAll([
                    {
                        type: ServerEventType.CardCountUpdate,
                        data: {playerIndex: player.index, count: player.cards.length} as CardCountUpdate
                    },
                    {
                        type: ServerEventType.StackTopUpdate,
                        data: {card: this.stackTop} as StackTopUpdate
                    }
                ]);

                switch (card.value) {
                    case CardValue.PlusTwo:
                        this.pickupCount += 2;
                        break;
                    case CardValue.PlusFour:
                        this.pickupCount += 4;
                        this.awaitingColorChoice = true;
                        player.sendServerEvent({type: ServerEventType.ColorChoiceRequired});
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
                        this.awaitingColorChoice = true;
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
            case ClientActionType.PickColor:
                const {color} = clientAction.data as PickColor;
                if (color === CardColor.Black) {
                    player.sendServerEvent({type: ServerEventType.InvalidAction});
                } else {
                    this.stackColor = color;
                    this.sendServerEventToAll({
                        type: ServerEventType.StackColorUpdate,
                        data: {
                            color
                        } as StackColorUpdate
                    });
                    this.awaitingColorChoice = false;
                }
                break;
            case ClientActionType.HitDeck:
                this.giveCards(Math.max(this.pickupCount, 1), player.cards);
                this.pickupCount = 0;
                player.sendServerEvent({
                    type: ServerEventType.CardsUpdate,
                    data: {cards: player.cards} as CardsUpdate
                });
                this.sendServerEventToAll({
                    type: ServerEventType.CardCountUpdate,
                    data: {
                        playerIndex: player.index as number,
                        count: player.cards.length
                    } as CardCountUpdate
                });
                break;
            default:
                console.warn(`unknown client action type: ${clientAction.type}`);
                break;
        }

        this.chooseNextPlayer();
    }

    private chooseNextPlayer(): void {
        if (this.awaitingColorChoice) return;
        this.currentPlayerIndex = this.getNextPlayerIndex(this.currentPlayerIndex);

        if (this.skipNext) {
            this.sendServerEventToAll({
                type: ServerEventType.PlayerSkipped,
                data: {
                    playerIndex: this.players[this.currentPlayerIndex]!.index
                } as PlayerSkipped
            });
            this.skipNext = false;
            this.chooseNextPlayer();
            return;
        }

        const player = this.players[this.currentPlayerIndex]!;
        if (!this.checkPlayerHasValidCard(player)) {
            this.giveCards(Math.max(this.pickupCount, 1), player.cards);
            player.sendServerEvent({
                type: ServerEventType.CardsUpdate,
                data: {
                    cards: player.cards
                } as CardsUpdate
            });
            this.pickupCount = 0;
            this.sendServerEventToAll({
                type: ServerEventType.CardCountUpdate,
                data: {
                    playerIndex: player.index,
                    count: player.cards.length
                } as CardCountUpdate
            });
            this.chooseNextPlayer();
            return;
        }

        this.sendServerEventToAll({
            type: ServerEventType.PlayerTurnUpdate,
            data: {
                currentPlayerIndex: this.currentPlayerIndex
            } as PlayerTurnUpdate
        });

        this.manageLobby();
    }

    private getNextPlayerIndex(currIndex: number): number {
        let nextIndex = (currIndex + (this.isReversed ? -1 : 1) + this.maxPlayers) % this.maxPlayers;
        let counter = 0;
        while ((this.players[nextIndex] as Player).cards.length === 0 && counter < this.maxPlayers) {
            nextIndex = (nextIndex + (this.isReversed ? -1 : 1) + this.maxPlayers) % this.maxPlayers;
            counter++;
        }
        if (counter === this.maxPlayers) throw 'invalid server state';
        return nextIndex;
    }

    private checkPlayerHasValidCard(player: Player): boolean {
        return player.cards.some(card => this.checkIsCardValid(card));
    }

    private manageLobby(): void {
        const stackLimit = parseInt(process.env.STACK_LIMIT!);
        if (this.stack.length > stackLimit) {
            const poppedCards: Card[] = [];
            for (let i = 0; i < stackLimit; i++) {
                poppedCards.push(this.stack.shift()!);
            }
            Card.shuffle(poppedCards);
            this.deck.unshift(...poppedCards);
        }

        if (this.activePlayers > 1) return;
        this.sendServerEventToAll({
            type: ServerEventType.GameEnded,
        });
        this.dispose();
    }


    private checkIsCardValid(card: Card): boolean {
        if (this.pickupCount > 0) {
            if ((this.stackTop as Card).value === CardValue.PlusTwo) {
                return card.value === CardValue.PlusTwo || card.value === CardValue.PlusFour;
            } else {
                if ((this.stackTop as Card).value === CardValue.PlusFour) {
                    return card.value === CardValue.PlusFour;
                } else {
                    throw 'impossible state';
                }
            }
        } else {
            if (card.color === this.stackColor! || card.color === CardColor.Black) {
                return true;
            } else {
                return (this.stackTop as Card).value === card.value;
            }
        }
    }

    private giveCards(count: number, cardsRef: Card[]): void {
        const poppedCards = [];
        for (let i = 0; i < count; i++) {
            poppedCards.push(this.deck.pop() as Card);
        }
        const length = poppedCards.length;
        for (let i = 0; i < length; i++) cardsRef.push(poppedCards[i] as Card);
    }

    private dispose(): void {
        this.players.forEach(player => player.dispose());
        Lobby.lobbies.delete(this.lobbyId);
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

    private sendServerEventsToAll(serverEvents: ServerEvent[]): void {
        serverEvents.forEach(ev => this.sendServerEventToAll(ev));
    }
}
