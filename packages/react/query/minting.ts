import {
    fetchEvents,
    fetchEventsCacheConf,
    fetchSpotsCacheConf,
    fetchSupplyCacheConf,
} from 'packages/core/api/minting';
import {
    MintingEvent,
    fetchSupply,
    fetchSpots,
    fetchEvent,
} from 'packages/core/api/minting';
import { useQuery, useQueries } from 'react-query';

/**
 * Query a minting event currently open to the public for the given canister
 * @param canister canister id as string
 * @returns
 */
export function useOpenEvent(canister: string) {
    const query = useQuery<MintingEvent[], string>(
        `events-${canister}`,
        () => fetchEvents(canister),
        fetchEventsCacheConf
    );
    // Filter out private and out of time events.
    const events = query.data?.filter(
        x =>
            x.access === 'public' &&
            x.startDate?.toMillis() <= new Date().getTime() &&
            (x.endDate?.toMillis() === 0 ||
                x.endDate?.toMillis() >= new Date().getTime())
    );
    const withSupply = useQueries(
        events?.map(x => ({
            queryKey: `event-supply-${canister}-${x.id}`,
            queryFn: async () => ({
                supply: await fetchSupply(canister, x.id),
                event: x,
            }),
            ...fetchSupplyCacheConf,
            enable: query.data?.length,
        })) || []
    );

    return withSupply.find(x => x.data?.supply && x.data.supply > 0);
}

/**
 * Query number of mints connected user is allowed for given event.
 * @param canister canister id as string
 * @param event event index
 * @returns
 */
export function useSpots(canister: string, event: number) {
    return useQuery(
        `event-spots-${canister}-${event}`,
        () => fetchSpots(canister, event),
        fetchSpotsCacheConf
    );
}

/**
 * Query event object for a specific event.
 * @param canister canister id as string
 * @param event event index
 * @returns
 */
export function useEvent(canister: string, event: number) {
    return useQuery(
        `event-${canister}-${event}`,
        () => fetchEvent(canister, event),
        fetchEventsCacheConf
    );
}

/**
 * Query supply for given event
 * @param canister canister id as string
 * @param event event index
 * @returns
 */
export function useEventSupply(canister: string, event: number) {
    return useQuery(
        `event-supply-${canister}-${event}`,
        () => fetchSupply(canister, event),
        fetchSupplyCacheConf
    );
}
