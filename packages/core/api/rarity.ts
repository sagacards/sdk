// Self-contained module determining rarity of any legend nft trait (back, border, ink, stock).

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type TraitType = 'border' | 'back' | 'ink' | 'stock';

// Regex powered lookup table covering all traits. Be careful about order of rules.
const rules: { [key: string]: [RegExp, Rarity][] } = {
    border: [[/.+/, 'common']],
    back: [
        [/(cinematic|cups-inverted)/, 'rare'],
        [/.+/, 'common'],
    ],
    ink: [
        [
            /^(copper|ferrous|energetic|sanguine|lavender|octarine|santo)$/,
            'common',
        ],
        [
            /(silver|ferrous-bright|energetic-bright|sanguine-bright|lavender-bright|octarine-bright|santo-bright|ward|fools-gold)/,
            'uncommon',
        ],
        [
            /(gold|ferrous-brilliant|energetic-brilliant|sanguine-brilliant|lavender-brilliant|octarine-brilliant|santo-brilliant|opal|garnet|crystal)/,
            'rare',
        ],
        [/(dusk|dawn|witching-hour)/, 'epic'],
        [
            /(sultan|sultana|bubble-gum|macbeth|.+-brilliant|cinematic|)/,
            'legendary',
        ],
        [/.+bright/, 'rare'],
        [/.+/, 'uncommon'],
    ],
    stock: [
        [/black/, 'common'],
        [/white/, 'uncommon'],
        [/.+gloss/, 'epic'],
        [/.+/, 'rare'],
    ],
};

/**
 * Lookup rarity for a trait.
 * @param type the type of trait (back, border, etc.)
 * @param trait the value of the trait
 * @returns
 */
export function rarity(type: TraitType, trait: string) {
    const _rules = rules?.[type];
    if (!_rules) {
        throw new Error(`Unknown trait type "${type}"`);
    }
    for (const [rule, rarity] of _rules) {
        const match = trait.match(rule);
        if (match && match[0] !== '') return rarity;
    }
    throw new Error(`Unknown trait "${trait}" of type "${type}"`);
}
