import {
    fetchProvenance,
    fetchProvenanceCacheConf,
    fetchRoot,
    fetchRootCacheConf,
    Transaction,
} from '@opentarot/core';
import { useQueries, useQuery } from 'react-query';
import { useDirectory } from './dab';

/**
 * Query provenance events for a given NFT canister.
 * @param canister canister id as string
 * @returns
 */
export function useProvenance(canister: string) {
    // Retrieve provenance canister for this NFT canister.
    const { data: root } = useQuery(
        `provenance-root-${canister}`,
        () => fetchRoot(canister),
        fetchRootCacheConf
    );

    // Retrieve provenance events for this NFT canister.
    const query = useQuery(
        `provenance-events-${canister}`,
        () => fetchProvenance(root as string),
        {
            enabled: !!root,
            ...fetchProvenanceCacheConf,
        }
    );

    return {
        events: query.data,
        isLoading: query.isLoading,
        error: query.error,
        query,
    };
}

/**
 * Query provenance for all NFT canisters.
 * @returns
 */
export function useAllProvenance() {
    // Retrieve all tarot NFT canisters.
    const { data: canisters } = useDirectory();

    // Retrieve cap root for all canisters
    const roots = useQueries(
        canisters?.map(c => ({
            queryKey: `provenance-root-${c.principal}`,
            queryFn: () => fetchRoot(c.principal),
            ...fetchRootCacheConf,
        })) || []
    );

    // Retrieve provenance events for all NFT canisters.
    const query = useQueries(
        roots.map(c => ({
            queryKey: `provenance-events-${c.data}`,
            queryFn: () => fetchProvenance(c.data as string),
            enabled: !!roots,
            ...fetchProvenanceCacheConf,
        }))
    );

    return query.reduce(
        (agg, x) => [...agg, ...(x.data || [])],
        [] as Transaction[]
    );
}
