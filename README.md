<p align="center">
  <img src="https://raw.githubusercontent.com/gfax/junkyard-brawl/master/logo.jpg" alt="Junkyard Brawl">
</p>

[![Build Status](https://travis-ci.org/gfax/junkyard-brawl.svg?branch=master)](https://travis-ci.org/gfax/junkyard-brawl)
[![codecov](https://codecov.io/gh/gfax/junkyard-brawl/branch/master/graph/badge.svg)](https://codecov.io/gh/gfax/junkyard-brawl)
[![dependencies Status](https://david-dm.org/gfax/junkyard-brawl/status.svg)](https://david-dm.org/gfax/junkyard-brawl)

A nodejs implementation of the card game Junkyard Brawl.

- [Installation](#installation)
- [Game rules](#game-rules)
- [Deck](#deck)
  - [Attack cards](#attack-cards)
  - [Unstoppable cards](#unstoppable-cards)
  - [Support cards](#support-cards)
  - [Counter cards](#counter-cards)
  - [Disaster cards](#disaster-cards)
  - [Inventory](#inventory)
- [API](#api)
  - [new JunkyardBrawl()](#new-junkyardbrawl)
  - [announceCallback()](#announcecallback)
  - [whisperCallback()](#whispercallback)
  - [addPlayer()](#addplayer)
  - [start()](#start)
  - [stop()](#stop)
  - [play()](#play)
  - [discard()](#discard)
  - [pass()](#pass)
  - [announceStatus()](#announceStatus)
  - [whisperStatus()](#whisperstatus)

## Installation

The node module can be found in the npmjs repository as [junkyard-brawl](https://www.npmjs.com/package/junkyard-brawl)

```sh
# Install via Yarn - https://yarnpkg.com/lang/en/
yarn add junkyard-brawl
# Install via npm
npm install --save junkyard-brawl
```

And required in a project like so:
```js
require('junkyard-brawl')
```

The module is built using ES6 classes, so Node v4 and below isn't supported. Node 6+ or current LTS recommended.

## Game rules

Junkyard Brawl is a card game played against 2 or more players.
The objective is to use your cards to beat up the other players and be the last one standing.

**Your Turn:**
At the beginning of your turn, you immediately draw back up to 5 cards if you have less than 5 in your hand.
When it's your turn to play, pick an Attack card and an opponent to attack, or a Support card if you wish to heal.
Every card is labeled with a type to let you know how and when it can be played.
Instead of attacking, you may discard any cards you don’t want.
If you have no playable cards, you must discard; you cannot pass!
After discarding or playing an attack, your turn is over.
At the end of your turn, you do not draw more cards unless your move was discarding or a card you played specifically grants you the privilege to draw cards.

**Discarding:**
If you decide on your turn to discard instead of attacking, you may discard any cards, then immediately draw cards until you have 5 cards back in your hand.

**Attack Cards and Unstoppable Cards:**
As the name implies, Attack cards are played against the opponent you wish to attack.
If the card has a red number next to the name, this tells you how much damage that player will receive if they don’t counter the attack.
Attack cards may have a "*[miss turns]*" number by their name as well, which tells you how many turns that opponent will lose if they don’t block or dodge it.
Unstoppable cards, as the name implies, are attacks that the opponent cannot counter.
They will also have indicators for damage the opponent will receive or amount of turns the opponent will miss.
Many attack cards have a special function detailed in the card description.

**You’re Attacked!:**
You can decide whether to respond to an Attack card, or pass up the chance and simply accept your fate.
Counter cards are played to negate or mitigate the damage you receive when being attacked.
If you Counter an attack with a Grab, then you must also play an Attack, Support, or Unstoppable card face down along with it.
Grabs do not block Attacks, but they offer a chance to counter-attack or heal immediately after you are attacked.
Your opponent must respond to your Grab by countering your hidden card or by passing and accepting fate.

**Grab Cards:**
Although they are Counter cards, you can also use them to Grab other players on your own turn.
Players can’t play a Dodge card when being grabbed.
You must lay your intended Attack/Unstoppable/Support card underneath the Grab, face down.
The attacked player doesn’t get to see what card is attacking him until he responds with a Counter or passes.
If the card that grabbed him turns out to be an Unstoppable attack, any counter card played against the Grab's hidden attack is thwarted and discarded.

**Disaster Cards:**
Disaster cards affect either all players or a random player in some way.
They do not consume a turn.
Play these cards at the beginning of anyone’s turn before any attacks commence.
The current-turn player finishes drawing before the effects of the Disaster card are processed.
Disaster cards cannot be countered.

## Deck

### Attack cards

- Wrench (-0) (miss-2) – Throw a wrench in your opponent's machinery. He must spend 2 turns finding what jammed his gears. [The wrench is mightier than the sword... unless it's a sword made out of wrenches.]
- Gut Punch (-2) – Basic attack.
- Grease Bucket (-2) (miss-1) – Even more painful than it is messy. [You need a dirty weapon for a dirty job.]
- Neck Punch (-3) – Slightly more powerful attack directed at the neck of your opponent.
- Acid Coffee (-3) (miss-1) – Opponent gets sick for a turn due to battery acid being poured in his coffee.
- Guard Dog (-4) – Sick one of the dogs on your opponent. [It's amazing how easily old steak becomes a bribe.]
- Uppercut (-5) – Ultimate attack.
- Gamblin’ Man (-1 to -6) – If successful in reaching the opponent, roll the die to see how much damage the opponent takes.
- Siphon (-1) (+1) – Steal one health from your opponent.

### Unstoppable cards

Special attack cards that cannot be countered.

- Bulldozer – Push all of your opponent’s hand cards into the discard, leaving him vulnerable to attack.
- Crane – Dump cards you don’t want on your opponent then draw that amount back from the deck. [The difference between junk and trash? Junk is more durable.]
- Magnet – Discard any cards you don’t want and pull out that many from your opponent’s hand.
- Tire (-0) (miss-1) – Throw a tire around your opponent, impeding his movement and causing him to lose a turn.
- Cheap Shot (-1) – Hit your opponent when he least expects it. [I want you to hold your turn. Hold it between your knees.]
- A Gun (-2) – Can’t dodge a gun. Simple as that. [Who needs ammo?]
- Tire Iron (-3) – Whack your defenseless opponent senseless.
- Meal Steal (+0 to +9) – Steal all of an opponent’s soup and subs, if he has any, and use them on yourself.

### Support cards

Play these on your turn in place of attacking if you so wish.

- Soup (+1) – Take a sip. Relax. Gain up to 10 health. [There is no useless junk – only useless junkyard workers.]
- Sub (+2) – Heal yourself by 2 points, up to a maximum of 10. [The flies are having another union meeting.]
- Energy Drink (+3) – Gain 1 health per turn for 3 turns. Only consumes the first turn, with health added automatically for the next two.
- Armor (+5) – Adds 5 points to your health. It can stack above 10, for a maximum of 15.
- Surgery (+9) – Can only be used when you have 1 health. Resets health to 10. [It's a nice day to... START AGAIN!]
- Sleep (+?) – Discard an attack card to receive its damage as health.

### Counter cards

- Block – Block a basic attack card. Can be used against a Grab to nullify the Grab’s leading attack.
- Dodge – Similar to a Block, but the attack is passed onto the next player. Cannot counter a Grab.
- Grab – Play this as a Counter so you can attack back. This cannot be dodged.
- Mattress (+2) – Reduces opponent’s attack by 2 points.
- Mirror (-?)(miss-?) – Mirror your opponent's attack, after taking the damage to yourself.
- Insurance (+5) – Can only be used against a counter-able killing blow. Resets you to 5 health points.

### Disaster cards

- Avalanche (-6) – A scrap pile avalanches! 6 damage to a random player, possibly you!
- Deflector – Next attack played against you automatically attacks a random player other than you.
- Earthquake (-1) – An earthquake shakes the entire Junkyard! 1 damage to everyone, starting with you.
- Gas Spill (miss-2) – Random player misses 2 turns.
- It’s Getting Windy – All players choose a random card from the player preceding them.
- Reverse – REVERSE playing order then immediately skip the current player's turn.
- Spare Bolts – Take an extra turn after your turn. [They're not pack rats – they're just open-minded collectors.]
- THE BEES (-1) – Random player is stung by bees! Victim holds onto this card and takes 1 damage every turn until using a support card. [Oh no! Not the bees! Not the bees! AAAAHHH!]
- Toolbox – Draw until you have 8 cards in your hand.
- Whirlwind – Each player shifts the cards in his hand over to the player beside him.

### Inventory

- 10 – Gut Punches, Neck Punches
- 8 – Grabs
- 7 – Kickballs, Subs
- 6 – Dodges
- 5 – Blocks, Uppercuts
- 3 – Mattresses, Grease Buckets, Soups
- 2 – Acid Coffees, Cheap Shots, Gamblin' Mans, Guard Dogs, Insurances, Mirrors, Siphons, Surgeries, Tires, Wrenches
- 1 – A Gun, Armor, Avalanche, Bulldozer, Crane, Deflector, Diesel Spill, Earthquake, Energy Drink, It’s Getting Windy, Magnet, Meal Steal, Sleep, Spare Bolts, Reverse, The Bees, Tire Iron, Toolbox, Whirlwind

## API

### new JunkyardBrawl()

To require the game in your project, load the module and create a new class instance from the module.

```js
const JunkyardBrawl = require('junkyard-brawl')
// This will return a new game instance:
const game = new JunkyardBrawl(userId, userName, announceCallback, whisperCallback, language)
```
param                | type     ||
-------------------- | -------- |-
`userId`             | string   | Unique ID for the user that initiated the game play. This will be the first player and game manager.
`userName`           | string   | Display name of the player, used in battle text.
[`announceCallback`] | function | Callback that is invoked when there is a public message to be displayed to all users.
[`whisperCallback`]  | function | Private messages to display to individual users, like what cards they currently have.

[`announceCallback`]: #announcecallback
[`whisperCallback`]: #whispercallback

A game instance consists of the following properties:
```js
{
  // The announceCallback that was passed in on instantiation.
  announceCallback: [Function: announceCallback],
  // This is the draw pile - an array of card objects.
  deck: [ ... ],
  // Cards that were played. This is shuffled and put
  // back in the deck when the deck becomes empty.
  discardPile: [],
  // Array of players that have died or forfeited.
  dropouts: [],
  // Language that messages will be displayed in.
  language: 'en',
  // Usually the user that started the game. Managers have
  // elevated priveleges such as removing other players.
  manager: Player { ... },
  // Array of players currently playing the game.
  players: [ ... ],
  // Date object of the time the game started,
  // or false if the game hasn't started yet.
  started: Date { ... },
  // Date object of the time the game stopped,
  // or false if the game hasn't stopped yet.
  stopped: false,
  // The player currently being targeted, or null if nobody.
  target: Player {},
  // Name of the game.
  title: 'Junkyard Brawl',
  // Turns played so far this game
  turns: 0,
  // The whisperCallback that was passed in on instantiation.
  whisperCallback: [Function: whisperCallback]
}
```

### announceCallback()

This is a callback passed in to the constructor on instantiation.
All public game events and game state changes are passed in here.

```js
const JunkyardBrawl = require('junkyard-brawl')
const announceCallback = (code, message, messageProps) => console.log(message)
const game = new JunkyardBrawl(userId, userName, announceCallback, whisperCallback, language)
```

param          | type     ||
-------------- | -------- |-
`code`         | string   | Message key for the language phrase.
`message`      | string   | Rendered message from the game’s set language.
`messageProps` | object   | Contains the game objects (lodash options) required to re-render the message from the original lodash template.
`template`     | function | The original lodash template, in case you want to reformat the message props and render the message yourself. Usage can be found in the [lodash docs](https://lodash.com/docs/4.17.4#template).

All codes can be found in [src/phrases.yml](https://github.com/gfax/junkyard-brawl/blob/master/src/phrases.yml) along with their translations.
For easy reference though, here's some important ones:

- `game:created` - A player has initialized a new game. At this point, the game has not yet started and is simply waiting for additional players to join.
- `game:no-survivors` - The game is over because no one is left alive. It is safe to destroy the game instance at this point.
- `game:stopped` - The game has been stopped pre-maturely. It is safe to destroy the game instance at this point.
- `game:transferred` - The game manager (`game.manager`) has been changed to another player.
- `game:turn` - A new turn has started. The game starts the first time this code is received.
- `game:winner` - A player has won the game. It is safe to destroy the game instance at this point.

### whisperCallback()

This is a callback passed in to the constructor on instantiation.
All private game events are passed in here, like the list of cards a player received.

```js
const JunkyardBrawl = require('junkyard-brawl')

const whisperCallback = (player, code, message, messageProps, template) => {
  console.log(`(( ${player} )) -- ${message}`)
}

const game = new JunkyardBrawl(userId, userName, announceCallback, whisperCallback, language)
```

param          | type     ||
-------------- | -------- |-
`userId`       | string   | ID of the user this message is intended for.
`code`         | string   | Message key for the language phrase.
`message`      | string   | Rendered message from the game’s set language.
`messageProps` | object   | Contains the game objects (lodash options) required to re-render the message from the original lodash template.
`template`     | function | The original lodash template, in case you want to reformat the message props and render the message yourself. Usage can be found in the [lodash docs](https://lodash.com/docs/4.17.4#template).

Example using the template:

```js
// Re-parse the template using the messageProps, but
// extend the messageProps so the player name is *bold*.
const whisperCallback = (player, code, message, messageProps, template) => {
  console.log(template(
    messageProps.extend({
      player: player.extend({
        name: `*${player.name}*`
      })
    })
  )
}
```

### addPlayer()

Join a new player to the game. Players can join a game that has already started. Players that have already left the game (though forfeit or death) cannot rejoin.

```js
const JunkyardBrawl = require('junkyard-brawl')
const game = new JunkyardBrawl('W0C2A5BA6', 'Jay', announceCallback, whisperCallback, language)
// This will also return the new player instance for easy inspection:
const player = game.addPlayer('WBE1F94D7', 'Kevin')
```

A player object consists of the following properties:

```js
{
  // Array of functions. Pending conditions to trigger after a player is affected by a card.
  afterContact: [],
  // Array of functions. Pending conditions to trigger before a player is affected by a card.
  beforeContact: [],
  // Array of functions. Pending conditions to trigger when the player's turn starts.
  beforeTurn: [],
  // Array of cards attached to the player while special conditions are in effect.
  // Not only does this let us see what conditions are currently applied to the player
  // for the purpose of displaying player status, but in the event of a pre-mature death
  // the cards can be quickly collected and put in the discard pile.
  conditionCards: [],
  // Array of card objects. Temporary discard of cards
  // to which the other player may need to respond.
  discard: [],
  // Player gets to go again if they have any extra turns
  extraTurns: 0,
  // Array of card objects available to the player for play.
  hand: [Array],
  // Current number of health points
  hp: 10,
  // The unique user ID for the player
  id: 'WBE1F94D7',
  // Maximum number of cards the player can be dealt, though
  // some cards may cause the player to have more cards than
  // this (they just won't be dealt more on their turn.)
  maxHand: 5,
  // Maximum number of health points. A player cannot heal any higher than
  // this number (with the exception of a few cards, such as "Armor").
  maxHp: 10,
  // If the player was caused to miss any turns, they are counted here.
  missTurns: 0
  // Display name to use for this player in announcements and notifications.
  name: 'Kevin',
  // Turns the player has taken so far
  turns: 0
}
```

### start()

Starting a game will deal cards to all the players, shuffle the play order, and announce the first player.
The game needs a minimum of two players to start.

```js
const JunkyardBrawl = require('junkyard-brawl')
const game = new JunkyardBrawl('W0C2A5BA6', 'Jay', announceCallback, whisperCallback, language)
game.addPlayer('WBE1F94D7', 'Kevin')
game.start()
```

### stop()

If the game needs to be canceled for any reason, it can be stopped so that a game-ending
message appears and scores can be logged before the game instance is destroyed.


```js
const JunkyardBrawl = require('junkyard-brawl')
const game = new JunkyardBrawl('W0C2A5BA6', 'Jay', announceCallback, whisperCallback, language)
game.addPlayer('WBE1F94D7', 'Kevin')
game.start()
game.stop() // Perhaps the player changed their mind and cancelled the match.
```

### play()

Once a game is started, players can play cards.
`game.players` contains a rotating array of players, with the first player in the array being the turn-player.
[`whisperCallback()`](#whispercallback) will be invoked if a player attempts an invalid play.

```js
const JunkyardBrawl = require('junkyard-brawl')
const game = new JunkyardBrawl('W0C2A5BA6', 'Jay', announceCallback, whisperCallback, language)
game.addPlayer('WBE1F94D7', 'Kevin')
game.start()
const [player1, player2] = game.players
game.play(player1, '2', player2)
```

param      | type                      ||
---------- | ------------------------- |-
`playerId` | player/string             | The player object for the user requesting to play, or simply the ID of the user that was passed in when the player was added. The game can distinguish valid players from invalid players.
`request`  | card object/array/string  | The request must either be a card object, an array of card objects, or a string of card indexes. Card indexes count from 1. So cards[0] and cards[3], would become '1 4'. This is useful for handling chatroom game adapters where a player may say the index of the cards they want to play.
`targetId` | string                    | ID of the player being attacked. In a 2-player game, the opposite player is assumed and the parameter is ignored. Likewise, with player moves that don't require a target the parameter is also ignored in such a case.

### discard()

Instead of playing a card, a player may wish to instead discard on their turn.
This will remove the requested cards from the player's hand and deal back that many cards to the player.
[`whisperCallback()`](#whispercallback) will be invoked if a player attempts an invalid discard.

```js
const JunkyardBrawl = require('junkyard-brawl')
const game = new JunkyardBrawl('W0C2A5BA6', 'Jay', announceCallback, whisperCallback, language)
game.addPlayer('WBE1F94D7', 'Kevin')
game.start()
const [{ id: playerId }] = game.players
game.discard(playerId, '1 4 2')
```

param      | type                      ||
---------- | ------------------------- |-
`playerId` | player/string             | The player object for the user requesting to play, or simply the ID of the user that was passed in when the player was added. The game can distinguish valid players from invalid players.
`request`  | card object/array/string  | The request must either be a card object, an array of card objects, or a string of card indexes. Card indexes count from 1. So cards[0] and cards[3], would become '1 4'. If no cards are specified, the player's entire hand will be discarded.

### pass()

If a player decides to pass their chance to respond to an attack, this method should be invoked instead of `play()`.
Remember that a player cannot pass on their turn.
[`whisperCallback()`](#whispercallback) will be invoked if a player attempts an invalid pass.

```js
const JunkyardBrawl = require('junkyard-brawl')
const Deck = require('junkyard-brawl/deck')
const game = new JunkyardBrawl('W0C2A5BA6', 'Jay', announceCallback, whisperCallback, language)
game.addPlayer('WBE1F94D7', 'Kevin')
game.start()
const [player1, player2] = game.players
const gutPunch = Deck.getCard('gut-punch') // Generate an extra card to give to the first player
player1.hand.push(gutPunch) // You wouldn't actually do this in a real implementation
game.play(player1, [gutPunch]) // Attack the second player
game.pass(player2) // Player doesn't wish to counter the Gut Punch attack.
```

param      | type          ||
---------- | ------------- |-
`playerId` | player/string | The player object or player/user id for the user wishing to pass on responding to the attack. Invalid user requests are ignored or notified as necessary.

### announceStatus()

If the game's status need to be re-fetched (the status that display at the beginning of each turn), this method will invoke [`announceCallback()`](#announecallback) with the code `game:status` and corresponding message and message props.

```js
const JunkyardBrawl = require('junkyard-brawl')
const game = new JunkyardBrawl('W0C2A5BA6', 'Jay', announceCallback, whisperCallback, language)
game.addPlayer('WBE1F94D7', 'Kevin')
game.start()
game.announceStatus()
```

### whisperStatus()

If a player's personal status need to be re-fetched, this method will invoke [`whisperCallback()`](#whispercallback) with the code `player:status` and corresponding message and message props.

```js
const JunkyardBrawl = require('junkyard-brawl')
const game = new JunkyardBrawl('W0C2A5BA6', 'Jay', announceCallback, whisperCallback, language)
const player = game.addPlayer('WBE1F94D7', 'Kevin')
game.start()
game.whisperStatus(player)
```

param      | type          ||
---------- | ------------- |-
`playerId` | player/string | The player object or player/user id for the user wishing to pass on responding to the attack. Invalid user requests are ignored or notified as necessary.
