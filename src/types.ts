import {Card} from './models/card.js';

export enum LobbyState {
    WaitingForPlayers,
    Running,
    Ended,
    AllPlayersLeft
}

export enum CardColor {
    Red,
    Green,
    Blue,
    Yellow,
    Black
}

export enum CardValue {
    Zero,
    One,
    Two,
    Three,
    Four,
    Five,
    Six,
    Seven,
    Eight,
    Nine,
    PlusTwo,
    PlusFour,
    Skip,
    Reverse,
    ColorChange,
}

export interface ClientAction {
    type: ClientActionType,
    data?: ClientActionData,
}

export enum ClientActionType {
    PickColor,
    SubmitCard,
    HitDeck,
}

export type ClientActionData = PickColor | SubmitCard;

export interface PickColor {
    color: CardColor,
}

export interface SubmitCard {
    cardIndex: number,
}

export interface ServerEvent {
    type: ServerEventType,
    data?: ServerEventData,
}

export enum ServerEventType {
    InvalidAction,
    PlayerIndexSync,
    CSPlayersSync,
    CardsUpdate,
    StackTopUpdate,
    CardCountUpdate,
    DirectionUpdate,
    PlayerTurnUpdate,
    StackColorUpdate,
    CardValidity,
    PlayerOut,
    PlayerSkipped,
    GameStarted,
    GameEnded,
    CardSubmissionRequired,
    ColorChoiceRequired,
}

export type ServerEventData = InvalidAction | StateInitializeEvent | StateUpdateEvent | InfoEvent | InputRequiredEvent;
export type StateInitializeEvent = PlayerIndexSync | CSPlayersSync;
export type StateUpdateEvent = CardsUpdate | StackTopUpdate | CardCountUpdate | DirectionUpdate | PlayerTurnUpdate | StackColorUpdate;
export type InfoEvent = CardValidity | PlayerOut | PlayerSkipped;
export type InputRequiredEvent = CardSubmissionRequired;

export type InvalidAction = string;

export interface ClientSidePlayer {
    name: string,
    cardCount: number,
    index: number
}

export interface PlayerIndexSync {
    playerIndex: number
}

export interface CSPlayersSync {
    players: ClientSidePlayer[]
}

export interface CardsUpdate {
	cards: Card[]
}

export interface StackTopUpdate {
	card: Card
}

export interface CardCountUpdate {
	playerIndex: number,
	count: number
}

export interface DirectionUpdate {
	isReversed: boolean
}

export interface PlayerTurnUpdate {
	currentPlayerIndex: number
}

export interface StackColorUpdate {
	color: CardColor
}

export interface CardValidity {
	isValid: boolean
}

export interface PlayerOut {
	playerIndex: number
}

export interface PlayerSkipped {
	playerIndex: number
}

export interface CardSubmissionRequired {
	deckPenalty: number
}