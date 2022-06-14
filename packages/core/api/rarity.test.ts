import { rarity } from './rarity';

test('Finds rarity for all known traits', () => {
    for (const trait of traits) {
        expect(rarity(...trait)).not.toBeNull();
    }
});

test('Finds correct rarity for series ink', () => {
    expect(rarity('ink', 'empress')).toBe('uncommon');
});

test('Finds correct rarity for a bright ink', () => {
    expect(rarity('ink', 'lavender-bright')).toBe('uncommon');
});

// A list of all known traits.
const traits: [string, string][] = [
    ['stock', 'black'],
    ['stock', 'white'],
    ['stock', 'priestess'],
    ['stock', 'priestess-gloss'],
    ['ink', 'copper'],
    ['ink', 'ferrous'],
    ['ink', 'energetic'],
    ['ink', 'sanguine'],
    ['ink', 'lavender'],
    ['ink', 'octarine'],
    ['ink', 'santo'],
    ['ink', 'silver'],
    ['ink', 'ferrous-bright'],
    ['ink', 'energetic-bright'],
    ['ink', 'sanguine-bright'],
    ['ink', 'lavender-bright'],
    ['ink', 'octarine-bright'],
    ['ink', 'santo-bright'],
    ['ink', 'ward'],
    ['ink', 'fools-gold'],
    ['ink', 'series'],
    ['ink', 'gold'],
    ['ink', 'ferrous-brilliant'],
    ['ink', 'energetic-brilliant'],
    ['ink', 'sanguine-brilliant'],
    ['ink', 'lavender-brilliant'],
    ['ink', 'octarine-brilliant'],
    ['ink', 'santo-brilliant'],
    ['ink', 'opal'],
    ['ink', 'garnet'],
    ['ink', 'crystal'],
    ['ink', 'series-bright'],
    ['ink', 'dusk'],
    ['ink', 'dawn'],
    ['ink', 'witching-hour'],
    ['ink', 'sultan'],
    ['ink', 'sultana'],
    ['ink', 'bubble-gum'],
    ['ink', 'macbeth'],
    ['ink', 'series-brilliant'],
    ['ink', 'cinematic'],
    ['back', 'fate'],
    ['back', 'saxon'],
    ['back', 'saxon-bordered'],
    ['back', 'saxon-worn'],
    ['back', 'compass'],
    ['back', 'helmet'],
    ['back', 'knotwork-moon'],
    ['back', 'knotwork-ravens'],
    ['back', 'odal-rune'],
    ['back', 'raven-outline'],
    ['back', 'raven-solid'],
    ['back', 'swords'],
    ['back', 'wyrd'],
    ['back', 'oath-rings-inverted'],
    ['back', 'oath-rings'],
    ['back', 'cup-extra'],
    ['back', 'cup-wider'],
    ['back', 'cups'],
    ['back', 'cinematic'],
    ['back', 'cup-inverted'],
];
