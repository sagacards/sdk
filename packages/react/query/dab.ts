import { getAll, getAllCacheConf } from 'packages/core/api/dab';
import { useQuery } from 'react-query';

/**
 * Query all tarot NFTs.
 * @returns
 */
export function useDirectory() {
    return useQuery('dab', getAll, getAllCacheConf);
}
