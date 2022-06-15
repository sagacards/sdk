import React from 'react';
import { Principal } from '@dfinity/principal';
import {
    agent,
    fetchRegistry,
    fetchRegistryCacheConf,
    filterDecks,
    getAll,
    getAllCacheConf,
    TarotNftCollection,
} from '@opentarot/core';
import { principalToAddress } from 'ictool';
import { useQueries, useQuery } from 'react-query';

/**
 * Query all tarot NFTs.
 * @returns
 */
export function useDirectory() {
    return useQuery('dab', getAll, getAllCacheConf);
}

/**
 * Query all deck NFTs
 * @returns
 */
export function useDecks() {
    const decks = useDirectory();
    return decks?.data ? filterDecks(decks.data) : [];
}

/**
 * Query all decks owned by the connected user.
 */
export function useOwnedDecks(owner?: Principal) {
    const decks = useDecks();

    const registries = useQueries(
        decks?.map(d => ({
            queryKey: `${d.principal}-registry`,
            queryFn: () => fetchRegistry(d.principal),
            enabled: !!decks,
            ...fetchRegistryCacheConf,
        })) || []
    );

    const owned = React.useMemo(() => {
        const flat = registries?.flatMap(x => x.data);
        const filter = flat.filter(x => {
            if (
                owner &&
                x !== undefined &&
                x.owner.toLowerCase() ===
                    principalToAddress(owner).toLowerCase()
            ) {
                return true;
            }
            return false;
        });
        const map = filter.map(x => ({
            ...x,
            deck: decks?.find(y => y.principal === x?.canister),
        })) as {
            canister: string;
            token: number;
            owner: string;
            deck?: TarotNftCollection;
        }[];
        return map;
    }, [registries, owner]);

    return owned;
}
