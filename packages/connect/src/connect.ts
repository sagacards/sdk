import { atom, useAtom } from 'jotai';
import { Principal } from '@dfinity/principal';
// @ts-ignore
import { StoicIdentity } from 'ic-stoic-identity';
import {
    host,
    invalidateIdentity,
    replaceIdentity,
    respawnActorsPlug,
    respawnActorsStandard,
    whitelist,
} from '@opentarot/core';

export type Wallet = 'plug' | 'stoic';

interface ConnectStore {
    pendingConnection: boolean;
    connection?: {
        principal: Principal;
        wallet: Wallet;
    };
}

const store = atom<ConnectStore>({
    pendingConnection: false,
});

export function useConnect() {
    const [connect, set] = useAtom(store);

    /**
     * Call at the before connection attempt to ensure idempotence.
     * @returns function which must be called after connection attempt
     */
    function idempotentConnect() {
        if (connect.pendingConnection) return null;
        set(state => ({ ...state, pendingConnection: true }));
        return () => set(state => ({ ...state, pendingConnection: false }));
    }

    /**
     * Post connection hook.
     */
    function postConnect(wallet: Wallet) {
        // Track connected wallet
        window.localStorage.setItem('wallet', wallet);

        // Plug actors workaround.
        if (wallet === 'plug') respawnActorsPlug();
    }

    /**
     * Attempt to connect to stoic wallet.
     */
    function connectStoic() {
        // Ensure singular connection attempt.
        const complete = idempotentConnect();
        if (complete === null) return;

        StoicIdentity.load()
            .then(async (identity: any) => {
                if (!identity) {
                    identity = await StoicIdentity.connect();
                }

                replaceIdentity(identity);

                set(state => ({
                    ...state,
                    connection: {
                        principal: identity.getPrincipal(),
                        wallet: 'stoic',
                    },
                }));

                postConnect('stoic');
            })
            .finally(complete);
    }

    /**
     * Attempt to connect plug wallet.
     */
    async function connectPlug() {
        // Ensure singular connection attempt.
        const complete = await idempotentConnect();
        if (complete === null) return;

        // If the user doesn't have plug, send them to get it!
        if (window?.ic?.plug === undefined) {
            window.open('https://plugwallet.ooo/', '_blank');
            return;
        }

        try {
            await window.ic.plug.requestConnect({
                whitelist: await whitelist(),
                host,
            });
        } catch (e) {
            console.error(e);
            complete();
            return;
        }
        const agent = await window.ic.plug.agent;
        const principal = await agent.getPrincipal();

        complete();
        set(state => ({ ...state, connection: { principal, wallet: 'plug' } }));
        postConnect('plug');
    }

    /**
     * Disconnect current principal.
     */
    async function disconnect() {
        // Plug actors workaround.
        if (connect.connection?.wallet === 'plug') respawnActorsStandard();

        invalidateIdentity();
        StoicIdentity.disconnect();
        window.ic?.plug?.deleteAgent && window.ic?.plug?.deleteAgent();

        set(state => ({
            ...state,
            connection: undefined,
        }));

        window.localStorage.removeItem('wallet');
    }

    /**
     * Attempt to restore a live connection to user's plug wallet.
     */
    async function plugReconnect() {
        const plug = window?.ic?.plug;
        const complete = idempotentConnect();
        if (complete === null) return;

        if (
            (await plug?.isConnected()) &&
            window.localStorage.getItem('wallet') === 'plug'
        ) {
            const agent = await plug?.agent;

            if (!agent) {
                await plug?.createAgent({ host, whitelist: await whitelist() });
            }

            const principal = await plug?.agent?.getPrincipal();

            set(state => ({
                ...state,
                connection: {
                    principal,
                    wallet: 'plug',
                },
            }));
            postConnect('plug');

            complete();
            return true;
        }
        complete();
        return false;
    }

    /**
     * Attempt to restore a live connection to user's stoic wallet.
     */
    async function stoicReconnect() {
        if (
            window.localStorage.getItem('_scApp') &&
            window.localStorage.getItem('wallet') === 'stoic'
        ) {
            connectStoic();
            return true;
        }
        return false;
    }

    /**
     * Detects and restoers existing wallet connections.
     */
    function reconnect() {
        try {
            plugReconnect().then(r => {
                if (!r) stoicReconnect();
            });
        } catch (e) {
            console.error(e);
        }
        set(state => ({ ...state, pendingConnection: false }));
    }

    return {
        ...connect,
        connectPlug,
        connectStoic,
        reconnect,
        disconnect,
    };
}
