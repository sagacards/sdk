import { TarotNftCollection } from '@opentarot/core';
import {
    fetchOwner,
    fetchOwnerCacheConf,
    fetchRegistry,
    fetchRegistryCacheConf,
    fetchStats,
    fetchStatsCacheConf,
} from '@opentarot/core';
import React from 'react';
import { useQueries, useQuery } from 'react-query';
import { useDirectory } from './dab';

/**
 * Query owner of token
 * @param token ext token identifier string
 * @returns
 */
export function useOwner(token: string) {
    return useQuery<string>(
        `bearer-${token}`,
        () => fetchOwner(token),
        fetchOwnerCacheConf
    );
}

/**
 * Query fixed supply for all NFT canisters.
 * @returns
 */
export function useSupplyAll() {
    // Retrieve all tarot NFT canisters.
    const { data: canisters } = useDirectory();

    return useQueries(
        canisters?.map(c => ({
            queryKey: `${c.principal}-supply`,
            queryFn: async () => {
                return {
                    id: c.principal,
                    stats: await fetchStats(c.principal),
                };
            },
            ...fetchStatsCacheConf,
        })) || []
    ).reduce<{ complete?: boolean; data: { [key: string]: number } }>(
        (agg, query) => {
            if (query.data) {
                return {
                    complete: agg?.complete === false ? false : query.isSuccess,
                    data: {
                        ...agg.data,
                        [query.data.id]: Number(query.data?.stats?.supply),
                    },
                };
            } else {
                return agg;
            }
        },
        { data: {} }
    );
}

/**
 * Query fixed supply for specific canister.
 * @param canister canister id as string
 * @returns
 */
export function useSupply(canister: string) {
    const query = useQuery(
        `${canister}-supply`,
        async () => {
            return {
                id: canister,
                stats: await fetchStats(canister),
            };
        },
        fetchStatsCacheConf
    );
    return {
        ...query,
        data: query.data?.stats.supply,
    };
}

/**
 * Query to determine canisters with unminted supply.
 * @returns map of canister ids to remaining supply and collection data
 */
export function useUnminted() {
    // Retrieve all tarot NFT canisters.
    const { data: canisters } = useDirectory();

    const supply = useSupplyAll();

    // Retrieve registries for all canisters.
    const query = useQueries(
        canisters?.map(c => ({
            queryKey: `${c.principal}-registry`,
            queryFn: async () => ({
                id: c.principal,
                canister: c,
                registry: await fetchRegistry,
                supply: supply?.data?.[c.principal],
            }),
            ...fetchRegistryCacheConf,
            enabled: supply.complete,
        })) || []
    );

    const registries = React.useMemo(
        () =>
            query.reduce<{
                [key: string]: {
                    minted?: number;
                    data: TarotNftCollection;
                    supply: number;
                    unminted: number;
                };
            }>((agg, { data }) => {
                if (data) {
                    return {
                        ...agg,
                        [data.id]: {
                            minted: data.registry?.length,
                            data: data.canister,
                            supply: supply?.data?.[data.id],
                            unminted:
                                supply?.data?.[data.id] - data.registry?.length,
                        },
                    };
                } else {
                    return agg;
                }
            }, {}),
        [query, supply]
    );

    return registries;
}
