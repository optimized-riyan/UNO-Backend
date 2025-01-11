import { CardColor, CardValue } from "../types.js";

export class Card {
    public color: CardColor;
    public value: CardValue;

    constructor(color: CardColor, value: CardValue) {
        this.color = color;
        this.value = value;
    }

    static deckFactory(deckCount: number = 1): Card[] {
        let superDeck: Card[] = [];
        for (let i = 0; i < deckCount; i++) {
            superDeck = [...superDeck, ...Card.getSingleShuffledDeck()];
        }
        return superDeck;
    }

    private static getSingleShuffledDeck(): Card[] {
        const deck: Card[] = [
            new Card(CardColor.Red, CardValue.Zero),
            new Card(CardColor.Red, CardValue.One),
            new Card(CardColor.Red, CardValue.Two),
            new Card(CardColor.Red, CardValue.Three),
            new Card(CardColor.Red, CardValue.Four),
            new Card(CardColor.Red, CardValue.Five),
            new Card(CardColor.Red, CardValue.Six),
            new Card(CardColor.Red, CardValue.Seven),
            new Card(CardColor.Red, CardValue.Eight),
            new Card(CardColor.Red, CardValue.Nine),
            new Card(CardColor.Red, CardValue.PlusTwo),
            new Card(CardColor.Red, CardValue.PlusTwo),
            new Card(CardColor.Red, CardValue.Skip),
            new Card(CardColor.Red, CardValue.Skip),
            new Card(CardColor.Red, CardValue.Reverse),
            new Card(CardColor.Red, CardValue.Reverse),
            new Card(CardColor.Green, CardValue.Zero),
            new Card(CardColor.Green, CardValue.One),
            new Card(CardColor.Green, CardValue.Two),
            new Card(CardColor.Green, CardValue.Three),
            new Card(CardColor.Green, CardValue.Four),
            new Card(CardColor.Green, CardValue.Five),
            new Card(CardColor.Green, CardValue.Six),
            new Card(CardColor.Green, CardValue.Seven),
            new Card(CardColor.Green, CardValue.Eight),
            new Card(CardColor.Green, CardValue.Nine),
            new Card(CardColor.Green, CardValue.PlusTwo),
            new Card(CardColor.Green, CardValue.PlusTwo),
            new Card(CardColor.Green, CardValue.Skip),
            new Card(CardColor.Green, CardValue.Skip),
            new Card(CardColor.Green, CardValue.Reverse),
            new Card(CardColor.Green, CardValue.Reverse),
            new Card(CardColor.Blue, CardValue.Zero),
            new Card(CardColor.Blue, CardValue.One),
            new Card(CardColor.Blue, CardValue.Two),
            new Card(CardColor.Blue, CardValue.Three),
            new Card(CardColor.Blue, CardValue.Four),
            new Card(CardColor.Blue, CardValue.Five),
            new Card(CardColor.Blue, CardValue.Six),
            new Card(CardColor.Blue, CardValue.Seven),
            new Card(CardColor.Blue, CardValue.Eight),
            new Card(CardColor.Blue, CardValue.Nine),
            new Card(CardColor.Blue, CardValue.PlusTwo),
            new Card(CardColor.Blue, CardValue.PlusTwo),
            new Card(CardColor.Blue, CardValue.Skip),
            new Card(CardColor.Blue, CardValue.Skip),
            new Card(CardColor.Blue, CardValue.Reverse),
            new Card(CardColor.Blue, CardValue.Reverse),
            new Card(CardColor.Yellow, CardValue.Zero),
            new Card(CardColor.Yellow, CardValue.One),
            new Card(CardColor.Yellow, CardValue.Two),
            new Card(CardColor.Yellow, CardValue.Three),
            new Card(CardColor.Yellow, CardValue.Four),
            new Card(CardColor.Yellow, CardValue.Five),
            new Card(CardColor.Yellow, CardValue.Six),
            new Card(CardColor.Yellow, CardValue.Seven),
            new Card(CardColor.Yellow, CardValue.Eight),
            new Card(CardColor.Yellow, CardValue.Nine),
            new Card(CardColor.Yellow, CardValue.PlusTwo),
            new Card(CardColor.Yellow, CardValue.PlusTwo),
            new Card(CardColor.Yellow, CardValue.Skip),
            new Card(CardColor.Yellow, CardValue.Skip),
            new Card(CardColor.Yellow, CardValue.Reverse),
            new Card(CardColor.Yellow, CardValue.Reverse),
            new Card(CardColor.Black, CardValue.PlusFour),
            new Card(CardColor.Black, CardValue.PlusFour),
            new Card(CardColor.Black, CardValue.PlusFour),
            new Card(CardColor.Black, CardValue.PlusFour),
            new Card(CardColor.Black, CardValue.ColorChange),
            new Card(CardColor.Black, CardValue.ColorChange),
            new Card(CardColor.Black, CardValue.ColorChange),
            new Card(CardColor.Black, CardValue.ColorChange),
        ];
        this.shuffle(deck);

        return deck;
    }

    public static shuffle<T>(array: T[]): void {
        for (let i = 0; i < array.length; i++) {
            const swapIndex = randomInt(i, array.length);
            if (swapIndex === i || swapIndex === array.length) continue;
            const temp = array[swapIndex] as T;
            array[swapIndex] = array[i] as T;
            array[i] = temp;
        }

        function randomInt(start: number, end: number) {
            return Math.floor(Math.random() * (end - start)) + start;
        }
    }
}
