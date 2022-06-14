import {
    conversionCacheConf,
    fetchCyclesToXdr,
    fetchXdrToUsd,
} from '@opentarot/core';
import { useQuery } from 'react-query';

/**
 * Query ICP to USD conversion rate.
 * @returns
 */
export function useIcpToUsd() {
    return useQuery<number>(
        `icp-to-usd`,
        async () => {
            const cyclesToXdr = await fetchCyclesToXdr();
            const xdrToUsd = await fetchXdrToUsd();
            return cyclesToXdr * xdrToUsd;
        },
        conversionCacheConf
    );
}
