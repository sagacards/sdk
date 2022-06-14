import type { Principal } from '@dfinity/principal';
export type Like = [Principal, TokenIndex, Principal];
export interface Likes {
    count: (arg_0: Principal, arg_1: TokenIndex) => Promise<bigint>;
    dump: () => Promise<Stable>;
    get: (arg_0: [] | [Principal]) => Promise<[] | [Array<Like>]>;
    like: (arg_0: Principal, arg_1: TokenIndex) => Promise<undefined>;
    purge: () => Promise<undefined>;
    unlike: (arg_0: Principal, arg_1: TokenIndex) => Promise<undefined>;
}
export type Stable = Array<[Principal, Array<Like>]>;
export type TokenIndex = bigint;
export interface _SERVICE extends Likes {}
