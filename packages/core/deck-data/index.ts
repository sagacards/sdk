// Useful data on all tarot cards, and simple card draw methods

import cardDraw, { randomCardIndex } from './draws';

import TarotDeckData, {
    mapIntToCard,
    mapIntToSuit,
    mapIntToCardName,
    TarotMajorArcanaData,
} from './cards';

export {
    cardDraw,
    TarotDeckData,
    mapIntToCard,
    mapIntToSuit,
    mapIntToCardName,
    TarotMajorArcanaData,
    randomCardIndex,
};
