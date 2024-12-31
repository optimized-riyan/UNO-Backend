import {IncomingMessage} from 'http';
import { Player } from './models/player.js';
import { LobbyState } from './models/lobby.js';
import { Card } from './models/card.js';

export default function(socket: WebSocket, req: IncomingMessage): void {
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
    const lobby = player.lobby;

    socket.onmessage = (message: MessageEvent): void => {
        if (lobby.lobbyState !== LobbyState.Running) {
            sendInvalidActionMessage('game not yet running');
            return;
        }

        const clientMessage = message.data as ClientMessage;
        switch (clientMessage.type) {
            case ClientMessageType.ChosenCard:
                const cardIndex = (clientMessage.data as ChosenCard).cardIndex;
                if (!cardIndex) {
                    sendInvalidActionMessage('card index not provided');
                } else if (lobby.nextPlayer !== player) {
                    sendInvalidActionMessage('it is not your turn yet');
                } else if (cardIndex >= player.cards.length) {
                    sendInvalidActionMessage('card index out of range');
                } else if (!lobby.checkIsCardValid(player.cards[cardIndex] as Card)) {
                    sendInvalidActionMessage('invalid move');
                } else {
                    lobby.pushToStack(player, cardIndex);
                }
                break;
            default:
                sendInvalidActionMessage('unknown action');
                break;
        }
    };

    function sendServerMessage(serverMessage: ServerMessage): void {
        socket.send(JSON.stringify(serverMessage));
    }

    function sendInvalidActionMessage(message?: string) {
        sendServerMessage({
            type: ServerMessageType.InvalidAction,
            data: message,
        });
    }
}


interface ServerMessage {
    type: ServerMessageType,
    data?: string | PlayersUpdate | StackUpdate,
}

enum ServerMessageType {
    InvalidAction,
    PlayersUpdate,
    StackUpdate,
}

interface PlayersUpdate {
    updates: PlayerUpdate[],
}

interface PlayerUpdate {
    playerIndex: number,
    cardCount: number,
}

interface StackUpdate {
    topCard: Card,
}

interface ClientMessage {
    type: ClientMessageType,
    data: ChosenCard,
}

enum ClientMessageType {
    ChosenCard,
}

interface ChosenCard {
    cardIndex: number,
}