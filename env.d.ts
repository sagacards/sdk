/// <reference types="vite/client" />

import { ActorSubclass } from '@dfinity/agent';
import { IDL } from '@dfinity/candid';

// This is the stuff that plug wallet extension stuffs into the global window namespace.
// I stole this for Norton: https://github.com/FloorLamp/cubic/blob/3b9139b4f2d16bf142bf35f2efb4c29d6f637860/src/ui/components/Buttons/LoginButton.tsx#L59
declare global {
    interface Window {
        ic?: {
            plug?: {
                agent: any;
                createActor: <T>(args: {
                    canisterId: string;
                    interfaceFactory: IDL.InterfaceFactory;
                }) => Promise<ActorSubclass<T>>;
                isConnected: () => Promise<boolean>;
                createAgent: (args?: {
                    whitelist: string[];
                    host?: string;
                }) => Promise<undefined>;
                requestBalance: () => Promise<
                    Array<{
                        amount: number;
                        canisterId: string | null;
                        image: string;
                        name: string;
                        symbol: string;
                        value: number | null;
                    }>
                >;
                requestTransfer: (arg: {
                    to: string;
                    amount: number;
                    opts?: {
                        fee?: number;
                        memo?: number;
                        from_subaccount?: number;
                        created_at_time?: {
                            timestamp_nanos: number;
                        };
                    };
                }) => Promise<{ height: number }>;
                requestConnect: (opts: any) => Promise<'allowed' | 'denied'>;
                deleteAgent: () => Promise<void>;
            };
        };
    }
}
