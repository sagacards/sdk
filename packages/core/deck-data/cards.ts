// Useful data on all cards in a traditional tarot deck and methods for validating a data source.

import cardData from './data.json';

/** A completed deck of tarot cards. */
export type TarotDeckData = TarotCardData[];

/** A tarot card suit. */
export interface TarotSuit {
    name: 'Trump' | 'Cups' | 'Swords' | 'Wands' | 'Pentacles';
    index: 0 | 1 | 2 | 3 | 4;
    cardCount: 14 | 22;
}

/** Detailed data on a specific tarot card. */
export interface TarotCardData {
    index: number;
    name: string;
    number: number;
    arcana: string;
    suit: TarotSuit['name'];
    keywords: string[];
    meanings: {
        light: string[];
        shadow: string[];
    };
    element: string;
    questions: string[];
    fortunes: string[];
    affirmation?: string;
    archetype?: string;
    hebrew?: string;
    numerology?: string;
    astrology?: string;
    mythology?: string;
}

/** Data on all the cards in the tarot deck. */
export const TarotDeckData = cardData.cards as TarotDeckData;

/** Hard coded list of all suits. */
export const TarotSuitData: TarotSuit[] = [
    {
        name: 'Trump',
        index: 0,
        cardCount: 22,
    },
    {
        name: 'Cups',
        index: 1,
        cardCount: 14,
    },
    {
        name: 'Swords',
        index: 2,
        cardCount: 14,
    },
    {
        name: 'Wands',
        index: 3,
        cardCount: 14,
    },
    {
        name: 'Pentacles',
        index: 4,
        cardCount: 14,
    },
];

/** Hard coded list of all major arcana */
export const TarotMajorArcanaData = [
    'The Fool',
    'The Magician',
    'The High Priestess',
    'The Empress',
    'The Emperor',
    'The Hierophant',
    'The Lovers',
    'The Chariot',
    'Strength',
    'The Hermit',
    'Wheel of Fortune',
    'Justice',
    'The Hanged Man',
    'Death',
    'Temperance',
    'The Devil',
    'The Tower',
    'The Star',
    'The Moon',
    'The Sun',
    'Judgement',
    'The World',
];

/**
 * Maps an index to a tarot card.
 * @param int index of the card in the tarot deck
 * @returns tarot card data object
 */
export function mapIntToCard(int: number) {
    TarotDeckData.sort((a, b) => a.index - b.index);
    try {
        return TarotDeckData[int];
    } catch (e) {
        throw new Error(`No card exists for integer ${int}.`);
    }
}

/**
 * Determine suit for given card index.
 * @param int index of the card
 * @returns tarot suit data object
 */
export function mapIntToSuit(int: number) {
    const sortedSuitData = TarotSuitData.sort((a, b) => a.index - b.index);
    let previousSuitSum = 0;
    for (const suit of sortedSuitData) {
        if (int < suit.cardCount + previousSuitSum) {
            return suit.name;
        }
        previousSuitSum += suit.cardCount;
    }
    throw new Error(`No suit exists for integer ${int}.`);
}

/**
 * Determine name of a card given index.
 * @param int index of the card
 * @returns name of card as string
 */
export function mapIntToCardName(int: number) {
    const numberAsString = [
        undefined,
        'Ace',
        'Two',
        'Three',
        'Four',
        'Five',
        'Six',
        'Seven',
        'Eight',
        'Nine',
        'Ten',
        'Page',
        'Knight',
        'Queen',
        'King',
    ];
    const { number, suit } = mapIntToCard(int);
    if (suit === 'Trump') {
        return TarotMajorArcanaData[number];
    } else {
        return `${numberAsString[number]} of ${suit}`;
    }
}

/**
 * Retrieve card data given card index.
 * @param index card index
 * @returns tarot card data object
 */
export function getCardData(index: number) {
    return TarotDeckData.find(x => x.index === index) as TarotCardData;
}

export default TarotDeckData;
