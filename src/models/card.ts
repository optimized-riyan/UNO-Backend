export class Card {
    public color: CardColor;
    public value: CardValue;

    constructor(color: CardColor, value: CardValue) {
        this.color = color;
        this.value = value;
    }
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
    Skip,
    Reverse
}
