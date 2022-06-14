import { getAll, getAllCacheConf } from '@opentarot/core';
import { useQuery } from 'react-query';

/**
 * Query all tarot NFTs.
 * @returns
 */
export function useDirectory() {
    return useQuery('dab', getAll, getAllCacheConf);
}
