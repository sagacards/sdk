// Canister providing likes on NFTs.

import { Principal } from '@dfinity/principal';
import { TokenIndex } from '../idl/likes.did.d';
import { CacheConf } from './_common';
import { likes } from './actors';

////////////
// Types //
//////////

export interface Token {
    canister: string;
    index: number;
}

export interface Like {
    canister: string;
    index: number;
    user: string;
}

//////////////
// Mapping //
////////////

/**
 * Map a like from canister to ready-to-use typescript object.
 * @param candid a like returned from the likes canister
 */
export function mapLike(candid: [Principal, TokenIndex, Principal]): Like {
    return {
        canister: candid[0].toText(),
        index: Number(candid[1]),
        user: candid[2].toText(),
    };
}

///////////////
// Fetching //
/////////////

export const likesCacheConf: CacheConf = {
    cacheTime: 60_000 * 60 * 24,
    staleTime: 60_000 * 2,
    refetchInterval: 60_000 * 2,
};

/**
 * Like a token as currently connected identity.
 * @param token object with canister id and token index
 */
export function like(token: Token) {
    likes.like(Principal.fromText(token.canister), BigInt(token.index));
    // TODO: capture invalidation in hook
    // .then(() => queryClient.invalidateQueries(`likes-${token.canister}`));
}

/**
 * Unlike a token as the currently connected identity.
 * @param token object with canister id and token index
 */
export function unlike(token: Token) {
    likes.unlike(Principal.fromText(token.canister), BigInt(token.index));
    // TODO: capture invalidation in hook
    // .then(() => queryClient.invalidateQueries(`likes-${token.canister}`));
}

/**
 * Fetch all likes, or likes for a specific canister.
 * @param canister optional filter for canister id as principal
 * @returns likes for the given canister, or all likes
 */
export function fetchLikes(canister?: Principal) {
    return likes
        .get(canister ? [canister] : [])
        .then(r => (r[0] ? r[0].map(mapLike) : []));
}

/**
 * Fetch number of likes for a given token.
 * @param token object with canister id and token index
 * @returns number of likes for given token across all principals as a bigint
 */
export async function fetchLikeCount(token: Token) {
    return Number(
        await likes.count(
            Principal.fromText(token.canister),
            BigInt(token.index)
        )
    );
}
