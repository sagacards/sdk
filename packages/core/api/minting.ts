// Canister handling the minting/initial sale protocol.

import { Principal } from '@dfinity/principal';
import { DateTime } from 'luxon';
import {
    CacheConf,
    CanisterId,
    ICP8s,
    mapDate,
    mapToken,
    unpackResult,
} from './.common';
import { Data, Bazaar } from '../idl/bazaar.did.d';
import { ActorSubclass } from '@dfinity/agent';
import { bazaar, legend } from './actors';

////////////
// Types //
//////////

/** Possible states of a user's eligibility to mint. */
export type MintableResponse =
    | 'minting'
    | 'not-connected'
    | 'loading'
    | 'no-access'
    | 'insufficient-funds'
    | 'not-started'
    | 'ended'
    | 'no-supply'
    | 'mintable';

/** A minting event. */
export interface MintingEvent {
    id: number;
    price: ICP8s;
    access: 'private' | 'public';
    startDate: DateTime;
    endDate: DateTime;
    collection: EventCollectionDetails;
}

/** An NFT collection may have event-specific details. */
export interface EventCollectionDetails {
    canister: CanisterId;
    banner: string;
    icon: string;
    preview: string;
    name: string;
    description: string;
}

//////////////
// Mapping //
////////////

/**
 * Map minting event to ready-to-use typescript.
 * @param canister canister id as principal
 * @param candid event object returned from canister
 * @param index event index as bigint
 * @returns ready-to-use minting event object
 */
export function mapEvent(
    canister: Principal,
    candid: Data,
    index: bigint
): MintingEvent {
    return {
        id: Number(index),
        price: mapToken(candid.price),
        access: candid.accessType.hasOwnProperty('Private')
            ? 'private'
            : 'public',
        startDate: mapDate(candid.startsAt),
        endDate: mapDate(candid.endsAt),
        collection: {
            icon: candid.details.iconImageUrl,
            banner: candid.details.bannerImageUrl,
            preview: candid.details.previewImageUrl,
            description: candid.details.descriptionMarkdownUrl,
            name: candid.name,
            canister: canister.toString(),
        },
    };
}

///////////////
// Fetching //
/////////////

/**
 * Retrieve all minting events.
 * @returns all minting events from all canisters
 * Calls the bazaar canister.
 */
export async function fetchAllEvents(): Promise<MintingEvent[]> {
    return bazaar.getAllEvents().then(r => {
        return r.map(([p, e, i]) => mapEvent(p, e, i));
    });
}

/**
 * Retrieve minting event for a specific canister.
 * @param canister canister id as string
 * @returns all minting events for a specific canister
 * Calls the bazaar canister.
 */
export async function fetchEvents(canister: string): Promise<MintingEvent[]> {
    return bazaar.getEvents([Principal.fromText(canister)]).then(r => {
        return r.map(([p, e, i]) => mapEvent(p, e, i));
    });
}
export const fetchEventsCacheConf: CacheConf = {
    cacheTime: 60_000 * 60 * 24 * 7,
    staleTime: 60_000 * 60 * 24 * 1,
};

/**
 * Retrieve specific minting event.
 * @param canister canister id as string
 * @param event event index
 * @returns minting event if it exists
 * Calls the bazaar canister.
 */
export async function fetchEvent(canister: string, event: number) {
    try {
        return mapEvent(
            Principal.fromText(canister),
            unpackResult(
                await bazaar.getEvent(
                    Principal.fromText(canister),
                    BigInt(event)
                )
            ),
            BigInt(event)
        );
    } catch {
        throw new Error(`Failed to fetch event ${canister} ${event}`);
    }
}

/**
 * Retrieve remaining mint supply for an event.
 * @param canister canister id as string
 * @param event event index
 * @returns mint supply for an event as a number
 * Calls the NFT canister
 */
export async function fetchSupply(
    canister: string,
    event: number
): Promise<number> {
    return Number(
        await legend(canister).launchpadTotalAvailable(BigInt(event))
    );
}
export const fetchSupplyCacheConf: CacheConf = {
    cacheTime: 60_000 * 60 * 24,
    staleTime: 60_000,
    refetchInterval: 60_000,
};

/**
 * Retrieve event whitelist spots for principal.
 * @param canister canister id as string
 * @param event event index
 * @returns number of mints the connected identity is allowed for the given event
 */
export async function fetchSpots(
    canister: string,
    event: number
): Promise<number> {
    try {
        return Number(
            unpackResult(
                await bazaar.getAllowlistSpots(
                    Principal.fromText(canister),
                    BigInt(event)
                )
            )
        );
    } catch {
        throw new Error(`Failed to fetch spots ${canister} ${event}`);
    }
}
export const fetchSpotsCacheConf: CacheConf = {
    cacheTime: 60_000 * 60 * 24,
    staleTime: 60_000,
};

////////////////////
// Minting Logic //
//////////////////

/**
 * Determine whether a user can mint in an event.
 * @param event mapped minting event object
 * @param supplyRemaining number of nfts remaining to mint in the event
 * @param connected boolean anonymous vs authenticated status
 * @param userBalance amount of ICP in the user's minting account
 * @param userAllowlist remaining number of mints user is allowed in this event
 * @param isMinting boolean is the user currently minting an NFT
 * @returns string determining users eligibility to mint an NFT
 */
export function eventIsMintable(
    event?: MintingEvent,
    supplyRemaining?: number,
    connected?: boolean,
    userBalance?: ICP8s,
    userAllowlist?: number,
    isMinting?: boolean
): MintableResponse {
    let r: MintableResponse;
    if (isMinting) r = 'minting';
    else if (!connected) r = 'not-connected';
    else if (event === undefined || userBalance === undefined) r = 'loading';
    else if (userAllowlist === 0) r = 'no-access';
    else if (userBalance.e8s < event.price.e8s) r = 'insufficient-funds';
    else if (
        eventIsTimeGated(event) &&
        DateTime.now().toMillis() < event.startDate.toMillis()
    )
        r = 'not-started';
    else if (
        eventIsTimeGated(event) &&
        DateTime.now().toMillis() > event.endDate.toMillis()
    )
        r = 'ended';
    else if (supplyRemaining === 0) r = 'no-supply';
    else r = 'mintable';
    return r;
}

/**
 * Determine if an event is time gated.
 * @param event mapped minting event object
 * @returns true if this is a time gated event
 */
export function eventIsTimeGated(event?: MintingEvent) {
    return event?.endDate.toMillis() !== 0 || event?.startDate.toMillis() !== 0;
}

/**
 * Mint an NFT.
 * @param event mapped minting event object
 * @param supplyRemaining number of nfts remaining to mint in the event
 * @param connected boolean anonymous vs authenticated status
 * @param userBalance amount of ICP in the user's minting account
 * @param userAllowlist remaining number of mints user is allowed in this event
 * @param actor bazaar actor authenticated to the current user
 * @param index minting event index
 * @returns raw result from the canister
 */
export function mint(
    event?: MintingEvent,
    supplyRemaining?: number,
    connected?: boolean,
    userBalance?: ICP8s,
    userAllowlist?: number,
    actor?: ActorSubclass<Bazaar>,
    index?: number
) {
    const mintable = eventIsMintable(
        event,
        supplyRemaining,
        connected,
        userBalance,
        userAllowlist
    );
    if (
        mintable !== 'mintable' ||
        actor === undefined ||
        event === undefined ||
        index === undefined
    ) {
        throw new Error(`Cannot mint. ${mintable}`);
    }
    return actor.mint(
        Principal.fromText(event.collection.canister),
        BigInt(index)
    );
}
