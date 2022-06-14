import { Principal } from '@dfinity/principal';
import { DateTime } from 'luxon';

////////////
// Types //
//////////

// Principal in string form. Principals break when put in local storage, probably some solveable serialization issue.
export type CanisterId = string;

// Canisters often return ICP amounts in such a way.
export interface ICP8s {
    e8s: number;
}

export type CacheConf = {
    cacheTime?: number;
    staleTime?: number;
    refetchInterval?: number;
};

// Rust and Motoko result differ on capitalization.
export type Result<T, U> = { ok: T } | { err: U } | { Ok: T } | { Err: U };

export type DiscriminatedResult<T, U> =
    | { status: 'ok'; ok: T }
    | { status: 'Ok'; Ok: T }
    | { status: 'err'; err: U }
    | { status: 'Err'; Err: U };

//////////////
// Mapping //
////////////

// Suite of functions mapping canister data into idiomatic typescript.

/** Canister dates are BigInts with 6 extra digits. */
export function mapDate(candid: bigint): DateTime {
    const millis = Number(candid) / 10 ** 6;
    const date = DateTime.fromMillis(millis, {
        zone: 'America/Vancouver',
    });
    return date;
}

export function mapToken(candid: { e8s: bigint }): ICP8s {
    return { e8s: Number(candid.e8s) };
}

///////////
// Util //
/////////

/** Convert string or principal to Principal */
export function asPrincipal(principal: string | Principal): Principal {
    if (typeof principal === 'string') {
        return Principal.fromText(principal);
    }
    return principal;
}

// Adds a discriminated union field to canister result types.
// NOTE: Really feels like typescript is making me work for this...
export function typeResult<T, U>(
    result: Result<T, U>
): DiscriminatedResult<T, U> {
    if ('Ok' in result) {
        return { status: 'Ok', ...result };
    }
    if ('ok' in result) {
        return { status: 'ok', ...result };
    }
    if ('Err' in result) {
        return { status: 'Err', ...result };
    }
    if ('err' in result) {
        return { status: 'err', ...result };
    }
    throw new Error(`Unknown result type ${Object.keys(result)[0]}`);
}

export function unpackResult<T, U>(result: Result<T, U>): T {
    const r = typeResult(result);
    switch (r.status) {
        case 'ok':
            return r.ok;
        case 'Ok':
            return r.Ok;
        case 'err':
            throw new Error(
                `Error from canister: ${Object.keys(r.err)[0]} ${
                    Object.values(r.err)[0]
                }`
            );
        case 'Err':
            throw new Error(
                `Error from canister: ${Object.keys(r.Err)[0]} ${
                    Object.values(r.Err)[0]
                }`
            );
    }
}
