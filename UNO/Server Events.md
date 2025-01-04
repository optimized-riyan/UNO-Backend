1. CardsUpdate
2. StackTopUpdate
3. CardCountUpdate
4. DirectionUpdate
5. PlayerTurnUpdate
6. StackColorUpdate
7. CardValidity
8. PlayerWon
9. CardChoiceRequired
10. ColorPickRequired

## State Update Events
### CardsUpdate
no need for player index, since it will only be sent to let player know their "own" cards.
```
CardsUpdate {
	cards: Card[]
}
```

### StackTopUpdate
card on top of stack.
```
StackTopUpdate {
	card: Card
}
```

### CardCountUpdate
card count of a player, to update "others'" card count.
```
CardCountUpdate {
	playerIndex: number,
	count: number
}
```

### DirectionUpdate
```
DirectionUpdate {
	isReversed: boolean
}
```

### PlayerTurnUpdate
tells which player's turn it is.
```
PlayerTurnUpdate {
	currentPlayerIndex: number
}
```

### StackColorUpdate
determines what color of next card should be. Necessary when a wild card is submitted.
```
StackColorUpdate {
	color: CardColor
}
```


## Info Events
### CardValidity
client will only go ahead with animation if the card they chose was valid, otherwise it's a rollback with the error being displayed.
```
CardValidity {
	isValid: boolean
}
```

### PlayerWon
notifies that a player won. better than checking for player wins on client side (or is it?).
```
PlayerWon {
	playerIndex: number
}
```

## Request Input Events
### CardSubmissionRequired
also provides deckPenalty to tell the client how many cards he will get from the deck in case they don't want to submit a card.
```
CardSubmissionRequired {
	deckPenalty: number
}
```

### ColorPickRequired
```
ColorPickRequired {}
```