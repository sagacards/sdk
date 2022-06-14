import { DateTime } from 'luxon';
import { decodeTokenIdentifier, encodeTokenIdentifier } from 'ictool';
import { ExtListing, TokenIndex } from '../idl/legends.did.d';
import { ICP8s, unpackResult, mapDate, CacheConf } from './_common';
import { legend } from './actors';

////////////
// Types //
//////////

/** An NFT marketplace listing. */
export interface Listing {
    token: string;
    id: number;
    canister: string;
    locked?: DateTime;
    seller: string;
    price: Price;
    listed: boolean;
}

/** An exponent price object (from CAP). */
export interface Price {
    value: number;
    currency: string;
    decimals: number;
}

//////////////
// Mapping //
////////////

/**
 * Map an NFT marketplace listing from canister response to ready-to-use typescript.
 * @param canister canister id as string
 * @param listing listing response item from an ext canister
 * @returns ready-to-use listing
 */
export function mapListing(
    canister: string,
    [index, listing]: [TokenIndex, ExtListing]
): Listing {
    return {
        canister,
        token: encodeTokenIdentifier(canister, index),
        id: index,
        locked: listing.locked.length ? mapDate(listing.locked[0]) : undefined,
        seller: listing.seller.toText(),
        price: mapPrice(listing.price),
        listed: Number(listing.price) !== 0,
    };
}

/**
 * Map a price object from the IC to ready-to-use typescript.
 * @param price a bigint price number
 * @returns exponent price object
 */
export function mapPrice(price: bigint): Price {
    return {
        value: Number(price),
        decimals: 8,
        currency: 'ICP',
    };
}

/**
 * Convert exponent price object into a float.
 * @param price exponent price object
 * @returns price as float
 */
export function priceFloat(price: Price): number {
    return price.value / 10 ** price.decimals;
}

/**
 * Perform currency conversion and display exponent price object as string.
 * @param price exponent price object
 * @param conversion float conversion rate to apply to price
 * @returns price string rounded to two decimals
 */
export function priceConvertDisplay(price: Price, conversion: number): string {
    return `$${(priceFloat(price) * conversion).toFixed(2)}`;
}

/**
 * Display exponent price object as string.
 * @param price exponent price object
 * @returns prince string with currency rounded to two decimals
 */
export function priceDisplay(price: Price): string {
    return `${priceFloat(price).toFixed(2)} ${price.currency}`;
}

//////////////
// Queries //
////////////

/**
 * Retrieve NFT marketplace listings from a specific canister.
 * @param canister canister id as string
 * @returns ready-to-use listings
 */
export function queryListings(canister: string): Promise<Listing[]> {
    return legend(canister)
        .listings()
        .then(resp =>
            resp.map(([index, listing]) =>
                mapListing(canister, [index, listing])
            )
        )
        .catch(error => {
            console.error(
                `Error fetching listings from canister ${canister}`,
                error
            );
            throw new Error('Could not retrieve listings.');
        });
}
export const queryListingsCacheConf: CacheConf = {
    cacheTime: 60_000 * 60 * 24 * 7,
    staleTime: 10_000,
    refetchInterval: 60_000,
};
export const queryListingsCacheConfFast: CacheConf = {
    cacheTime: 60_000 * 5,
    staleTime: 10_000,
    refetchInterval: 10_000,
};

//////////////
// Updates //
////////////

/**
 * Call to edit a listing.
 * @param token ext token identifier string
 * @param price exponent ICP price object
 * @returns update message result
 * TODO: Error/result handling
 */
export function updateListing(token: string, price?: ICP8s) {
    const { canister } = decodeTokenIdentifier(token);
    return legend(canister)
        .list({
            token,
            from_subaccount: [],
            price: price ? [BigInt(price.e8s)] : [],
        })
        .then(unpackResult);
}

/** Call to lock a listing for purchase.
 * @param token ext identifier of token to be purchased
 * @param price price to pay in e8s form, must match list price
 * @param buyer address format of the purchasing principal
 * @returns address to transfer funds to complete purchase
 * TODO: Error/result handling
 */
export async function updateLock(token: string, price: ICP8s, buyer: string) {
    const { canister } = decodeTokenIdentifier(token);
    return unpackResult(
        await legend(canister).lock(token, BigInt(price.e8s), buyer, [])
    );
}

/////////////////
// Data Views //
///////////////

// We provide additional functions to achieve different views on the data, i.e. sorting and filtering.
// Use these methods inside a memo.

/**
 * NOT IMPLEMENTED: Filter a list of listings.
 */
export function filterListings() {
    throw new Error(`Not yet implemented`);
}

/**
 * Sort a list of listings.
 * @param listings array of nft secondary marketplace listings
 * @returns sorted listings array
 */
export function sortListings(listings: Listing[]) {
    return listings.sort((a, b) => a.price.value - b.price.value);
}
