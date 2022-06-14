// Generic API for EXT standard NFTs

import { decodeTokenIdentifier } from 'ictool';
import { ext } from './actors';
import { CacheConf, unpackResult } from './_common';

////////////
// Types //
//////////

// ...
export interface SomeType {}

//////////////
// Mapping //
////////////

/** Stats for an EXT standard NFT canister. */
export interface Stats {
    saleVolume: number;
    largestSale: number;
    smallestSale: number;
    floor: number;
    listings: number;
    supply: number;
    sales: number;
}

/** Map EXT canister stats response to ready-to-use form.
 * @param stats ext canister stats method response
 */
export function mapStats(
    stats: [bigint, bigint, bigint, bigint, bigint, bigint, bigint]
): Stats {
    return {
        saleVolume: Number(stats[0]),
        largestSale: Number(stats[1]),
        smallestSale: Number(stats[2]),
        floor: Number(stats[3]),
        listings: Number(stats[4]),
        supply: Number(stats[5]),
        sales: Number(stats[6]),
    };
}

///////////////
// Fetching //
/////////////

/** Retrieve owner of specific NFT.
 * @param token ext token identifier string
 */
export async function fetchOwner(token: string): Promise<string> {
    const { canister } = decodeTokenIdentifier(token);
    try {
        return unpackResult(await ext(canister).bearer(token));
    } catch {
        throw new Error(`Failed to fetch owner of token ${token}`);
    }
}
export const fetchOwnerCacheConf: CacheConf = {
    cacheTime: 60_000 * 60 * 24 * 7,
    staleTime: 60_000,
};

/**
 * Retrieve stats for an NFT canister.
 * @param canister canister id as string
 */
export async function fetchStats(canister: string): Promise<Stats> {
    return mapStats(await ext(canister).stats());
}
export const fetchStatsCacheConf: CacheConf = {
    cacheTime: 30 * 24 * 60 * 60_000,
    staleTime: 30 * 24 * 60 * 60_000,
};

/**
 * Retrieve registry of NFT canister.
 * @param canister canister id as string
 */
export async function fetchRegistry(canister: string) {
    return ext(canister).getRegistry();
}
export const fetchRegistryCacheConf: CacheConf = {
    cacheTime: 24 * 60 * 60_000,
    staleTime: 60_000,
};
