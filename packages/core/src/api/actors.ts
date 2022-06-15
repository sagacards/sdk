// A global singleton for our internet computer actors.

import * as Agent from '@dfinity/agent';
import { InterfaceFactory } from '@dfinity/candid/lib/cjs/idl';

import { idlFactory as BazaarIDL } from '../idl/bazaar.did';
import { idlFactory as CyclesIDL } from '../idl/cycles.did';
import { idlFactory as DabIDL } from '../idl/tarot-dab.did';
import { idlFactory as ExtIDL } from '../idl/ext.did';
import { idlFactory as LikesIDL } from '../idl/likes.did';
import { idlFactory as LegendsIDL } from '../idl/legends.did';
import { idlFactory as NnsIDL } from '../idl/ledger.did';
import type { Bazaar } from '../idl/bazaar.did.d';
import type { Cycles } from '../idl/cycles.did.d';
import type { EXT } from '../idl/ext.did.d';
import type { TarotDAB } from '../idl/tarot-dab.did.d';
import type { Ledger } from '../idl/ledger.did.d';
import type { LegendsNFT } from '../idl/legends.did.d';
import type { Likes } from '../idl/likes.did.d';

/** Map of existing actors */
const actors: {
    [key: string]: {
        actor: Agent.ActorSubclass<unknown>;
        idl: InterfaceFactory;
    };
} = {};

/////////////
// Config //
///////////

// TODO: Configurable
const conf = {
    IC_PROTOCOL: 'https',
    IC_HOST: 'ic0.app',
    BAZAAR_CANISTER_ID: 'h7wcp-ayaaa-aaaam-qadqq-cai',
    NNS_CANISTER_ID: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
    LIKES_CANISTER_ID: 'xnx6l-pyaaa-aaaaj-qasxa-cai',
    DAB_CANISTER_ID: 'g7fsx-wyaaa-aaaaj-qawcq-cai',
    CYCLES_CANISTER_ID: 'rkp4c-7iaaa-aaaaa-aaaca-cai',
};

const canisters: { [key: string]: string } = {
    bazaar: conf.BAZAAR_CANISTER_ID as string,
    likes: conf.LIKES_CANISTER_ID as string,
    cycles: conf.CYCLES_CANISTER_ID as string,
    dab: conf.DAB_CANISTER_ID as string,
};

for (const k in canisters) {
    if (!canisters[k]) {
        throw new Error(`Missing canister "${k}" ID: check envars.`);
    }
}

/** Complete list of canisters we use, including all hard-coded and all canisters in DAB. */
export const whitelist = async (): Promise<string[]> => [
    ...Object.values(canisters),
    ...(await dabWhitelist()),
];

/** Configuration for the ic network, defaults to mainnet. */
export const ic = {
    protocol: (conf.IC_PROTOCOL as string) || 'https',
    host: (conf.IC_HOST as string) || 'ic0.app',
};

/** Complete boundary node url. */
export const host = `${ic.protocol}://${ic.host}`;

////////////
// Agent //
//////////

// We share the same agent across all actors, and replace the identity when connection events occur.

/** When user connects an identity, we update our agent.
 * @param identity new identity for the agent.
 */
export function replaceIdentity(identity: Agent.Identity) {
    agent.replaceIdentity(identity);
}

/** When user disconnects an identity, we update our agent.
 * Should be called whenever a user disconnects.
 */
export function invalidateIdentity() {
    agent.invalidateIdentity();
}

/** Agent shared across all actors. */
export const agent = new Agent.HttpAgent({ host });

/////////////
// Actors //
///////////

// The actors make up the bulk of the public API of this module. We can import these to message ic canisters through this app. We shouldn't need any actors other than those defined here.

/** A canister tracking likes on NFTs */
export const likes = actor<Likes>(canisters.likes, LikesIDL);

/** The tarot minting protocol canister */
export const bazaar = actor<Bazaar>(canisters.bazaar, BazaarIDL);

/** Legends NFT canisters */
export const legend = generic<LegendsNFT>(LegendsIDL);

/** EXT standard NFT canisters */
export const ext = generic<EXT>(ExtIDL);

/** Cycles minting canister */
export const cycles = actor<Cycles>(canisters.cycles, CyclesIDL);

/** NNS canister */
export const nns = actor<Ledger>(canisters.nns, NnsIDL);

/** Directory of tarot NFTs canister */
export const dab = actor<TarotDAB>(canisters.dab, DabIDL);

//////////
// Lib //
////////

/** Get or create a canister
 * @param canisterId string id of the canister
 * @param idl interface factory of the canister
 * @param plug boolean to create using plug, defaults to `false`
 * @param recreate boolean force recreation of the canister, defaults to `false`
 * @param config additional config passed to actor creation
 */
export function actor<T>(
    canisterId: string,
    idl: InterfaceFactory,
    plug = false,
    recreate = false,
    config?: Agent.ActorConfig
): Agent.ActorSubclass<T> {
    if (recreate || !actors[canisterId]?.actor) {
        actors[canisterId] = {
            actor: create<T>(canisterId, idl, plug, config),
            idl: idl,
        };
    }
    return actors[canisterId].actor as Agent.ActorSubclass<T>;
}

/** Creates a new actor
 * Note: creating a new actor with a Plug connection is problematic.
 * @param canisterId string id of the canister
 * @param idl interface factory of the canister
 * @param plug boolean to create using plug, defaults to `false`
 * @param config additional config passed to actor creation
 */
function create<T>(
    canisterId: string,
    idl: InterfaceFactory,
    plug = false,
    config?: Agent.ActorConfig
): Agent.ActorSubclass<T> {
    if (!window?.ic?.plug) {
        throw new Error(`Attempt to create plug actor but plug isn't present.`);
    }
    // if (plug) {
    //     return await window?.ic?.plug.createActor<T>({
    //         canisterId,
    //         interfaceFactory: LegendsIDL,
    //     });
    // } else {
    return Agent.Actor.createActor<T>(idl, {
        canisterId,
        agent,
        ...config,
    });
    // }
}

/** Create a function that creates an actor using a generic IDL.
 * Useful when you need to create many actors using the same interface, e.g. many canisters using one standard.
 * @param idl interface factor of the canister
 */
function generic<T>(idl: InterfaceFactory) {
    return function (canisterId: string): Agent.ActorSubclass<T> {
        return actor<T>(canisterId, idl);
    };
}

/** We attempt to retrieve list of dab canisters first from the local react-query cache, then query the dab canister. */
async function dabWhitelist(): Promise<string[]> {
    const { getAll } = await import('./dab');
    try {
        const cache = window.localStorage.getItem(
            'REACT_QUERY_OFFLINE_CACHE'
        ) as string;
        const json = JSON.parse(cache);
        return json.clientState.queries
            .find((x: any) => x.queryKey === 'dab')
            .state.data.map((x: any) => x.principal);
    } catch {
        console.info('Could not retrieve dab from local cache, fetching.');
        return (await getAll()).map(x => x.principal);
    }
}

///////////
// Plug //
/////////

// The Plug paradigm is different from stoic or ii: it attempts to restrict access to a raw agent or identity. Instead it exposes an api for creating actors, which gives users more granular control over which canister methods an app like ours can call. We have to provide

/** Recreate all actors using the Plug API. Should be called when Plug is connected. */
export async function respawnActorsPlug() {
    if (!window?.ic?.plug) {
        throw new Error(
            'Failed respawning actors with Plug: Plug is not available.'
        );
    }

    for (const canisterId in actors) {
        actors[canisterId].actor = await window.ic.plug.createActor({
            canisterId,
            interfaceFactory: actors[canisterId].idl,
        });
    }
}

/** Recreate all actors using our standard method. Should be called when Plug is disconnected. */
export function respawnActorsStandard() {
    for (const canisterId in actors) {
        actors[canisterId] = actor(canisterId, actors[canisterId].idl);
    }
}

export { BazaarIDL, CyclesIDL, DabIDL, ExtIDL, LikesIDL, LegendsIDL, NnsIDL };
export type { Bazaar, Cycles, EXT, TarotDAB, Ledger, LegendsNFT, Likes };
