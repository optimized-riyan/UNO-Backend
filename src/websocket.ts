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
            sendInvalidActionMessage();
            return;
        }

        const clientMessage = message.data as ClientMessage;
        switch (clientMessage.type) {
            case ClientMessageType.ChosenCard:
                if (lobby.nextPlayer !== player) {
                    sendInvalidActionMessage();
                } else if (lobby.players) {

                }
                break;
            default:
                sendInvalidActionMessage();
                break;
        }
    };

    function sendServerMessage(serverMessage: ServerMessage): void {
        socket.send(JSON.stringify(serverMessage));
    }

    function sendInvalidActionMessage() {
        sendServerMessage({
            type: ServerMessageType.InvalidAction
        });
    }
}



interface ServerMessage {
    type: ServerMessageType,
    data?: PlayersUpdate | StackUpdate,
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
    data?: ChosenCard,
}

enum ClientMessageType {
    ChosenCard,
}

interface ChosenCard {
    cardIndex: number,
}