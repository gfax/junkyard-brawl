# Junkyard Brawl

[![Build Status](https://travis-ci.org/gfax/node-junkyard.svg?branch=master)](https://travis-ci.org/gfax/node-junkyard)
[![Coverage Status](https://coveralls.io/repos/github/gfax/node-junkyard/badge.svg?branch=master)](https://coveralls.io/github/gfax/node-junkyard?branch=master)

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

## Installation

The node module can be found in the npmjs repository as [junkyard-brawl](https://www.npmjs.com/package/junkyard-brawl)

```sh
# Install via Yarn - https://yarnpkg.com/lang/en/
yarn add junkyard-brawl
# Install via npm
npm install --save junkyard-brawl
```

## Game rules

Junkyard Brawl is a card game played against 2 or more players.
The objective is to use your cards to beat up the other players and be the last one standing.

**Your Turn:** When it's your turn to play, pick an opponent to attack, or a Support card if you wish to heal. Instead of attacking, you may discard any cards you don’t want. If you have no playable cards, you must discard. You cannot pass! After discarding or playing an attack, your turn is over.

**Discarding:** If you decide on your turn to discard instead of attacking, you may discard any cards, then immediately draw cards until you have 5 cards back in your hand.

**Drawing:** At the beginning of your turn, you immediately draw back up to 5 cards if you have less than 5 in your hand. At the end of your move, you do not draw back the cards you used unless your move was discarding or a card you played specifically grants you the privilege to draw cards.

**Attack Cards and Unstoppable Cards:** As the name implies, Attack cards are played against the opponent you wish to attack. If the card has a red number next to the name, this tells you how much damage that player will receive if they don’t counter the attack. Attack cards may have a (purple?) number by their name as well, which tells you how many turns that opponent will lose if they don’t block or dodge it. Unstoppable cards, as the name implies, are attacks that the opponent cannot counter. They will also have indicators for damage the opponent will receive or amount of turns the opponent will miss. Many attack cards have a special function (see card descriptions for details.)

**You’re Attacked!:** You can decide whether to respond to an Attack card, or pass up the chance and simply accept your fate. Counter cards are played to negate or mitigate the damage you receive when being attacked. If you Counter an attack with a Grab, then you must also play an Attack, Support, or Unstoppable card face down along with it. Grabs do not block Attacks, but they offer a chance to counter-attack or heal immediately after you are attacked. Your opponent must respond to your Grab by countering your hidden card or by passing and accepting fate.

**Grab Cards:** Although they are Counter cards, you can also use them to Grab other players on your own turn. Players can’t play a Dodge card when being grabbed. You must lay your intended Attack/Unstoppable/Support card underneath the Grab, face down. The attacked player doesn’t get to see what card is attacking him until he responds with a Counter or passes. If the card that grabbed him turns out to be an Unstoppable attack, any counter card played against the Grab's hidden attack is thwarted and discarded.

**Disaster Cards:** Disaster cards affect either all players or a random player. They do not consume a turn. Play these cards at the beginning of anyone’s turn before any attacks commence. The current-turn player finishes drawing before the effects of the Disaster card are processed. Disaster cards cannot be countered.

## Deck

### Attack cards

- Wrench (-0) (miss-2) – Throw a wrench in your opponent's machinery. He must spend 2 turns finding what jammed his gears. [The wrench is mightier than the sword... unless it's a sword made out of wrenches.]
- Gut Punch (-2) – Basic attack.
- ~Grease Bucket~ (-2) (miss-1) – Even more painful than it is messy. [You need a dirty weapon for a dirty job.]
- Neck Punch (-3) – Slightly more powerful attack directed at the neck of your opponent.
- ~Acid Coffee~ (-3) (miss-1) – Opponent gets sick for a turn due to battery acid being poured in his coffee.
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
- ~Energy Drink~ (+3) – Gain 1 health per turn for 3 turns. Only consumes the first turn, with health added automatically for the next two.
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
- Propeller (x2) (x2) – Double the effects of a random player’s next successful Attack/Support.
- Reverse – REVERSE playing order. Skips opponent’s turn if a 2-player game.
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
- 2 – Acid Coffees, Cheap Shots, Gamblin' Mans, Guard Dogs, Insurances, Meal Steals, Mirrors, Siphons, Surgeries, Siphons, Tires, Wrenches
- 1 – A Guns, Armor, Avalanche, Bulldozer, Crane, Deflector, Diesel Spill, Earthquake, Energy Drink, It’s Getting Windy, Magnet, Propeller, Sleep, Spare Bolts, Reverse, The Bees, Tire Iron, Toolbox, Whirlwind
