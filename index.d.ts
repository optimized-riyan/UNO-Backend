declare enum LobbyState {
    WaitingForPlayers,
    Running,
    Ended,
    AllPlayersLeft
}

declare enum CardColor {
    Red,
    Green,
    Blue,
    Yellow,
    Black
}

declare enum CardValue {
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

interface ClientAction {
    type: ClientActionType,
    data: ClientActionData,
}

declare enum ClientActionType {
    PickColor,
    SubmitCard,
    HitDeck,
}

type ClientActionData = undefined | PickColor | SubmitCard;

interface PickColor {
    color: CardColor,
}

interface SubmitCard {
    cardIndex: number,
}

interface ServerEvent {
    type: ServerEventType,
    data: ServerEventData,
}

declare enum ServerEventType {
    InitialStateSync,
    PlayerConnected,
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

type ServerEventData = StateInitializeEvent | StateUpdateEvent | InfoEvent | InputRequiredEvent | undefined;
type StateInitializeEvent = InitialStateSync | PlayerConnected;
type StateUpdateEvent = CardsUpdate | StackTopUpdate | CardCountUpdate | DirectionUpdate | PlayerTurnUpdate | StackColorUpdate;
type InfoEvent = CardValidity | PlayerOut | PlayerSkipped;
type InputRequiredEvent = CardSubmissionRequired;

interface InitialStateSync {
    players: ClientSidePlayer[],
}

interface ClientSidePlayer {
    name: string,
    cardCount: number,
}

interface PlayerConnected {
    playerIndex: number,
	playerName: string,
	cardCount: number
}

interface CardsUpdate {
	cards: Card[]
}

interface StackTopUpdate {
	card: Card
}

interface CardCountUpdate {
	playerIndex: number,
	count: number
}

interface DirectionUpdate {
	isReversed: boolean
}

interface PlayerTurnUpdate {
	currentPlayerIndex: number
}

interface StackColorUpdate {
	color: CardColor
}

interface CardValidity {
	isValid: boolean
}

interface PlayerOut {
	playerIndex: number
}

interface PlayerSkipped {
	playerIndex: number
}

interface CardSubmissionRequired {
	deckPenalty: number
}