- CSPlayersSync
- PlayerIndexSync
- CardsUpdate
- StackTopUpdate
- CardCountUpdate
- DirectionUpdate
- PlayerTurnUpdate
- StackColorUpdate
- CardValidity
- PlayerOut
- PlayerSkipped
- GameStarted
- GameEnded
- CardSubmissionRequired
- ColorChoiceRequired

## State Initialize Events

### CSPlayersSync
to player that just connected, one-time client-side state sync for that player.
```
InitialStateSync {
	players: ClientSidePlayer[], // players that are already in lobby.
}
```

### PlayerIndexSync
```
PlayerIndexSync {
	playerIndex: number
}
```

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

### PlayerOut
notifies that a player won. better than checking for player wins on client side (or is it?).
```
PlayerOut {
	playerIndex: number
}
```

### PlayerSkipped
```
PlayerSkipped {
	playerIndex: number
}
```

### GameStarted
```
GameStarted {}
```

### GameEnded
```
GameEnded {}
```


## Request Input Events
### CardSubmissionRequired
also provides deckPenalty to tell the client how many cards they will get from the deck in case they don't want to submit a card.
```
CardSubmissionRequired {
	deckPenalty: number
}
```

### ColorChoiceRequired
```
ColorChoiceRequired {}
```