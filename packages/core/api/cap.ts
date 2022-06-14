// CAP is a service that provides provenance for NFTs. We query this service for a history of transaction and minting events across all NFT canisters.
// This file copies heavily from upstream CAP.
// TODO: Update to new upstream

import { Principal } from '@dfinity/principal';
import {
    Event as TransactionEvent,
    CapRouter,
    CapRoot,
    prettifyCapTransactions,
} from '@psychedelic/cap-js';
import { decodeTokenIdentifier } from 'ictool';
import { asPrincipal, CacheConf } from './.common';
import { host } from './actors';
import { Price } from './listings';

////////////
// Types //
//////////

// ...
export interface Transaction
    extends Omit<
        TransactionEvent,
        'to' | 'from' | 'caller' | 'operation' | 'time'
    > {
    item: number;
    to: string;
    from: string;
    caller: string;
    operation: string;
    time: Date;
    token: string;
    price: Price;
}

// ...
interface TransactionDetails {
    from: Principal | string;
    to: Principal | string;
    token?: string;
    tokenId?: string;
    token_id?: string;
    price?: bigint;
    price_decimals?: bigint;
    price_currency?: string;
}

// ...
type TokenField = 'token' | 'token_id' | 'tokenId';
type TokenFields = TokenField[];

// ...
export interface CAPEvent {
    timestamp: Date;
    type: 'mint' | 'transfer' | 'sale';
}

//////////////
// Mapping //
////////////

/** Map a list of CAP events for use in this application.
 * @param data a response
 */
export function mapCAP(data?: TransactionEvent[]): Transaction[] {
    if (!data || !Array.isArray(data) || !data.length) return [];

    return (
        data
            .reduce<Transaction[]>((agg, transaction) => {
                // Filter out transaction without a timestamp.
                if (transaction.time === undefined) {
                    return agg;
                }

                let t = Number(transaction.time);
                while (t > 9999999999999) {
                    t = t / 10;
                }
                const { details } = prettifyCapTransactions(
                    transaction
                ) as unknown as { details: TransactionDetails };

                // TODO: To remove "possible fields" as the Token Standard field is now available!
                // TODO: there are no conventions on naming fields
                // so, for the moment will check for matching token
                const possibleFields: TokenFields = [
                    'token',
                    'token_id',
                    'tokenId',
                ];
                const tokenField = possibleFields.find(field => details[field]);

                if (!tokenField) return agg;

                const itemHandler = (
                    details: TransactionDetails,
                    tokenField: TokenField
                ) => {
                    let tokenIndex: number | undefined;

                    if (typeof details?.token_id === 'bigint') {
                        return details.token_id;
                    }

                    try {
                        const tokenIdText = details[tokenField];

                        if (!tokenIdText)
                            throw Error('Oops! Token field not found');

                        const { index } = decodeTokenIdentifier(tokenIdText);
                        tokenIndex = index;

                        if (!tokenIndex)
                            throw Error('Oops! Not a valid tokenIndex');
                    } catch (err) {
                        // console.warn(err);
                    }

                    return tokenIndex;
                };

                return [
                    ...agg,
                    {
                        ...transaction,
                        item: tokenField
                            ? itemHandler(details, tokenField)
                            : undefined,
                        to: details?.to?.toString(),
                        from: details?.from?.toString(),
                        price: {
                            value: Number(details?.price),
                            currency: details?.price_currency,
                            decimals: Number(details?.price_decimals),
                        },
                        token: tokenField && details[tokenField],
                        operation: transaction.operation,
                        time: new Date(t),
                    },
                ];
            }, [])
            // Reverse the order
            // because the natural order that the data is presented
            // from the response, is at the very top
            // showing the oldest transaction in the page
            .sort((a, b) => b.time.getTime() - a.time.getTime())
    );
}

///////////////
// Fetching //
/////////////

const Router = CapRouter.init({});

/** Get CAP for given canister. NFT canisters have sister CAP canisters storing provenance.
 * @param canisterId canister id as string
 */
export async function fetchRoot(canisterId: string): Promise<string> {
    const root = await (
        await Router
    ).get_token_contract_root_bucket({
        tokenId: asPrincipal(canisterId),
        witness: false,
    });
    return root.canister[0].toText();
}
export const fetchRootCacheConf: CacheConf = {
    cacheTime: 30 * 24 * 60 * 60_000,
    staleTime: 30 * 24 * 60 * 60_000,
};

/** Get provenance events from a given CAP canister. Returns the first two pages.
 * @param canisterId canister id as string
 */
export async function fetchEvents(canisterId: string): Promise<Transaction[]> {
    // We grab the two most recent pages from the history canister.
    const root = await CapRoot.init({ canisterId, host });
    const response = await Promise.all([
        root.get_transactions({ witness: false }),
        root.get_transactions({ witness: false, page: 2 }),
    ]);

    // Map and return the data for use in this app.
    return mapCAP(response.reduce((agg, i) => [...agg, ...i.data], []));
}
export const fetchEventsCacheConf: CacheConf = {
    cacheTime: 60_000,
    staleTime: 60_000,
    refetchInterval: 60_000,
};
