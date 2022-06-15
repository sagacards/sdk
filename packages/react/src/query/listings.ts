import React from 'react';
import { useQuery, useQueries, useMutation } from 'react-query';
import { decodeTokenIdentifier } from 'ictool';
import { ICP8s } from '@opentarot/core';
import {
    Listing,
    queryListings,
    queryListingsCacheConf,
    queryListingsCacheConfFast,
    updateListing,
    updateLock,
} from '@opentarot/core';
import { useDirectory } from './dab';
import { queryClient } from '../provider';

/**
 * Determine whether a listing is locked.
 * @param listing listing object
 * @returns
 */
export function useIsLocked(listing?: Listing) {
    return React.useMemo(() => {
        return listing?.locked && listing.locked.diffNow().milliseconds > 0;
    }, [listing]);
}

////////////
// Query //
//////////

/**
 * Query listings for a specific canister.
 * @param canister canister id as string
 * @returns
 */
export function useCanisterListings(canister: string) {
    const query = useQuery<Listing[], string>(
        `listings-${canister}`,
        () => queryListings(canister),
        queryListingsCacheConf
    );
    return {
        listings: query.data,
        isLoading: query.isLoading,
        error: query.error,
        query,
    };
}

/**
 * Query all listings for all Legends canisters.
 * @returns
 */
export function useAllLegendListings() {
    const { data: dab } = useDirectory();
    const query = useQueries(
        dab?.map(canister => ({
            queryKey: `listings-${canister.principal}`,
            queryFn: () => queryListings(canister.principal),
            enabled: !!dab,
            ...queryListingsCacheConf,
        })) || []
    );
    return query.reduce(
        (agg, query) => [...agg, ...(query?.data || [])],
        [] as Listing[]
    );
}

/**
 * Query listings for specific token. Uses a much more aggressive fetch strategy.
 * @param token ext token identifier string
 * @returns
 */
export function useListing(token: string) {
    const { canister } = decodeTokenIdentifier(token);
    const query = useQuery(
        `listings-${canister}`,
        () => queryListings(canister),
        queryListingsCacheConfFast
    );
    return {
        ...query,
        data: query?.data && query.data.find(x => x.token === token),
    };
}

/////////////
// Mutate //
///////////

interface MutateListingRequest {
    token: string;
    price?: ICP8s;
}

/**
 * Edit a secondary market listing
 * @returns mutation handler for listings
 */
export function useMutateListing() {
    return useMutation<null, { err: string }, MutateListingRequest, unknown>({
        mutationFn: ({ token, price }) => updateListing(token, price),
        onSuccess(data, { token }: MutateListingRequest) {
            const { canister } = decodeTokenIdentifier(token);
            queryClient.invalidateQueries(`listings-${canister}`);
        },
        onError(data) {
            throw new Error(`Failed to update listing: ${data.err}`);
        },
    });
}

interface MutateLockRequest {
    token: string;
    price: ICP8s;
    buyer: string;
}

/**
 * Lock a listing for purchase
 * @returns mutation handler for locking
 */
export function useMutateLock() {
    return useMutation<string, null, MutateLockRequest, unknown>({
        mutationFn: ({ token, price, buyer }) =>
            updateLock(token, price, buyer),
    });
}
