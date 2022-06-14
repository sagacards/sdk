import { Principal } from '@dfinity/principal';
import { encodeTokenIdentifier } from 'ictool';
import {
    fetchLikeCount,
    fetchLikes,
    likesCacheConf,
} from 'packages/core/api/likes';
import { useQuery } from 'react-query';

/**
 * Query whether a token is liked by a principal.
 * @param canister canister id as principal
 * @param index token index
 * @param principal user who liked the token
 * @returns
 */
export function useIsLiked(
    canister: Principal,
    index: number,
    principal?: Principal
) {
    const query = useQuery(
        `likes-${canister.toText()}`,
        () => fetchLikes(canister),
        likesCacheConf
    );
    return {
        isLiked:
            query.data?.findIndex(
                x => x.user === principal?.toText() && x.index === index
            ) !== -1,
        isLoading: query.isLoading,
        error: query.error,
        query,
    };
}

/**
 * Query like count for a token.
 * @param canister canister id as principal
 * @param index token index
 * @returns
 */
export function useLikeCount(canister: Principal, index: number) {
    const query = useQuery(
        `likes-count-${canister.toText()}`,
        () => fetchLikeCount({ canister: canister.toText(), index }),
        likesCacheConf
    );
    return {
        count: query.data,
        isLoading: query.isLoading,
        error: query.error,
        query,
    };
}
