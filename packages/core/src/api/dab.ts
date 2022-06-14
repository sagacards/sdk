// DAB is a canister service which acts as a directory for NFTs. Saga has it's own DAB service, which we query for a list of all available tarot NFTs.

import { Metadata } from '../idl/tarot-dab.did.d';
import { CacheConf } from './_common';
import { dab } from './actors';

////////////
// Types //
//////////

type Entry = Omit<Metadata, 'details' | 'principal_id' | 'frontend'>;

/** Metadata for a tarot NFT collection */
export interface TarotNftCollection extends Entry {
    artists: string;
    principal: string;
    isDeck: boolean;
    previewImage?: string;
    bannerImage?: string;
}

//////////////
// Mapping //
////////////

/** Convert a google drive file url into an embedable uri
 * @param url a google drive file url
 *
 * This is a temporary hack to support collection images hosted in google drive.
 */
function driveHack(url: string) {
    return url.replace('file/d/', 'uc?id=').replace('/view?usp=sharing', '');
}

/** Map collection metadata into ready-to-use form.
 * @param entry a metadata object returned from the DAB canister
 */
function mapDabCanister(entry: Metadata): TarotNftCollection {
    const details = Object.fromEntries(entry.details);
    return {
        name: entry.name,
        thumbnail: driveHack(entry.thumbnail),
        description: entry.description,
        principal: entry.principal_id.toText(),
        // @ts-ignore: TODO improve this
        artists: details.artists.Text,
        // @ts-ignore: TODO improve this
        isDeck: details?.isDeck?.Text === 'true',
        // @ts-ignore: TODO improve this
        previewImage: driveHack(details?.preview_image.Text),
        // @ts-ignore: TODO improve this
        bannerImage: driveHack(details?.banner_image.Text),
    };
}

///////////////
// Fetching //
/////////////

/** Retrieve all tarot NFTS.
 * These can be all manner of tarot NFTs.
 */
export function getAll() {
    return dab.getAll().then(r => r.map(mapDabCanister));
}
export const getAllCacheConf: CacheConf = {
    cacheTime: 7 * 24 * 60 * 60_000,
    staleTime: 60 * 60_000,
};

/** Retrieve all tarot deck NFTS.
 * These are guaranteed to be complete decks of tarot card art.
 */
export function getAllDecks() {
    return getAll().then(r => r.filter(x => x.isDeck));
}
