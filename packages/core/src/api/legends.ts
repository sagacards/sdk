import { CacheConf } from './_common';
import { ic, legend } from './actors';
import { rarity, Rarity } from './rarity';

////////////
// Types //
//////////

/** Manifest for a legend NFT describing all relevant traits and assets. */
export interface LegendManifest {
    back: string;
    border: string;
    ink: string;
    // stock?: string;
    mask?: string;
    maps: {
        normal: string;
        layers: [string];
        back: string;
        border: string;
        background: string;
        mask?: string;
    };
    colors: {
        base: string;
        specular: string;
        emissive: string;
        background: string;
    };
    stock: {
        base: string;
        specular: string;
        emissive: string;
    };
    views: {
        flat: string;
        sideBySide: string;
        animated: string;
        interactive: string;
    };
}

/** Map describing all traits of a legend NFT */
export interface Traits {
    back: [string, Rarity | undefined];
    border: [string, Rarity | undefined];
    stock?: [string, Rarity | undefined];
    mask?: [string, Rarity | undefined];
    ink: [string, Rarity | undefined];
}

//////////////
// Mapping //
////////////

/**
 * Map manifest to traits object.
 * @param manifest a legend manifest
 * @returns a traits object
 */
export function mapManifestToTraits(manifest: LegendManifest): Traits {
    return {
        back: [manifest.back, rarity('back', manifest.back)],
        border: [manifest.border, rarity('border', manifest.border)],
        stock:
            typeof manifest.stock === 'string'
                ? [
                      manifest.stock,
                      manifest.stock
                          ? rarity('stock', manifest.stock)
                          : 'common',
                  ]
                : undefined,
        ink: [manifest.ink, rarity('ink', manifest.ink)],
        mask:
            typeof manifest.mask === 'string'
                ? [manifest.mask, 'common']
                : undefined,
    };
}

///////////////
// Fetching //
/////////////

/**
 * Fetch manifest for a specific legends NFT.
 * @param canister canister id as string
 * @param index token index
 */
export function fetchManifest(
    canister: string,
    index: number
): Promise<LegendManifest> {
    return fetch(
        `${ic.protocol}://${canister}.raw.${ic.host}/${index}.json`
    ).then(r => r.json() as unknown as LegendManifest);
}
export const fetchManifestCacheConf: CacheConf = {
    cacheTime: 60_000 * 60 * 24 * 365,
    staleTime: 60_000 * 60 * 24 * 365,
};

/**
 * Retrieve markdown format long description from a legend canister.
 * @param canisterId canister id as string
 * @returns null or canister description (poem) in plaintext markdown
 */
export async function fetchDescriptionMarkdown(canisterId: string) {
    return (
        await fetch(
            `${ic.protocol}://${canisterId}.raw.${ic.host}/assets/description.md`
        )
    ).text();
}
export const fetchDescriptionMarkdownCacheConf: CacheConf = {
    cacheTime: 60_000 * 60 * 24 * 365,
    staleTime: 60_000 * 60 * 24 * 365,
};
