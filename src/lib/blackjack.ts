export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Rank =
  | 'A'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K';

export interface PlayingCard {
  id: string;
  suit: Suit;
  rank: Rank;
  /** Numeric Blackjack base value (Ace = 11 before soft-hand adjustment, 10/J/Q/K = 10) */
  baseValue: number;
  /** Encoded card index 0..51 for FHE plaintext representation */
  cardIndex: number;
}

const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
const RANKS: Rank[] = [
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
];

export const SUIT_SYMBOLS: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

export function isRedSuit(suit: Suit): boolean {
  return suit === 'hearts' || suit === 'diamonds';
}

export function getRankBaseValue(rank: Rank): number {
  if (rank === 'A') return 11;
  if (rank === 'K' || rank === 'Q' || rank === 'J') return 10;
  return parseInt(rank, 10);
}

/**
 * Creates and cryptographically shuffles a standard 52-card deck
 * using Web Crypto API (crypto.getRandomValues) Fisher-Yates shuffle.
 */
export function createShuffledDeck(): PlayingCard[] {
  const deck: PlayingCard[] = [];
  let index = 0;

  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${rank}-${suit}-${index}`,
        suit,
        rank,
        baseValue: getRankBaseValue(rank),
        cardIndex: index,
      });
      index++;
    }
  }

  // Cryptographic Fisher-Yates shuffle
  const randomBuffer = new Uint32Array(deck.length);
  crypto.getRandomValues(randomBuffer);

  for (let i = deck.length - 1; i > 0; i--) {
    const j = randomBuffer[i] % (i + 1);
    const temp = deck[i];
    deck[i] = deck[j];
    deck[j] = temp;
  }

  return deck;
}

/**
 * Calculates optimal Blackjack hand score, automatically converting
 * Aces from 11 to 1 as needed to prevent busting.
 */
export function calculateHandScore(cards: PlayingCard[]): {
  score: number;
  isSoft: boolean;
} {
  let total = 0;
  let aces = 0;

  for (const card of cards) {
    total += card.baseValue;
    if (card.rank === 'A') {
      aces += 1;
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return {
    score: total,
    isSoft: aces > 0,
  };
}

/**
 * Plays out the dealer's remaining draws after the hole card is threshold-decrypted.
 * Standard casino rule: dealer hits on <= 16 and stands on >= 17.
 */
export function resolveDealerDraws(
  initialDealerHand: PlayingCard[],
  remainingDeck: PlayingCard[]
): {
  finalDealerHand: PlayingCard[];
  nextDeck: PlayingCard[];
  finalScore: number;
} {
  const hand = [...initialDealerHand];
  const deck = [...remainingDeck];

  let { score } = calculateHandScore(hand);
  while (score < 17 && deck.length > 0) {
    const nextCard = deck.shift()!;
    hand.push(nextCard);
    score = calculateHandScore(hand).score;
  }

  return {
    finalDealerHand: hand,
    nextDeck: deck,
    finalScore: score,
  };
}
