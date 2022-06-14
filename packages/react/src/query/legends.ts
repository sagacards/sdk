import React from 'react';
import { useQuery } from 'react-query';
import {
    fetchDescriptionMarkdown,
    fetchDescriptionMarkdownCacheConf,
    fetchManifest,
    fetchManifestCacheConf,
    mapManifestToTraits,
} from '@opentarot/core';

/**
 * Query manifest for a specific token.
 * @param canister canister id as string
 * @param index token index
 * @returns legend manifest
 */
export function useManifest(canister: string, index: number) {
    return useQuery(
        `manifest-${canister}-${index}`,
        () => fetchManifest(canister, index),
        fetchManifestCacheConf
    );
}

/**
 * Query traits for a given legends NFT.
 * @param canister canister id as string
 * @param index token index
 * @returns traits object
 */
export function useTraits(canister: string, index: number) {
    const manifest = useManifest(canister, index);
    return manifest?.data && mapManifestToTraits(manifest.data);
}

/**
 * Query description markdown (poem) for a specific canister.
 * @param canisterId canister id as string
 * @returns plaintext markdown poem
 */
export function useDescriptionMarkdown(canisterId: string) {
    return useQuery(
        `description-markdown-${canisterId}`,
        () => fetchDescriptionMarkdown(canisterId),
        fetchDescriptionMarkdownCacheConf
    );
}

/**
 * Query rarity for a given legend NFT.
 * @param canister canister id as string
 * @param index token index
 */
export function useRarity(canister: string, index: number) {
    const manifest = useManifest(canister, index);
    const rarity = React.useMemo(
        () => (manifest.data ? mapManifestToTraits(manifest.data) : undefined),
        [manifest.data]
    );
    return rarity;
}
