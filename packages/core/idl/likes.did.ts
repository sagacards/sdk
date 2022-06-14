import { IDL } from '@dfinity/candid';

export const idlFactory: IDL.InterfaceFactory = ({ IDL }) => {
    const TokenIndex = IDL.Nat;
    const Like = IDL.Tuple(IDL.Principal, TokenIndex, IDL.Principal);
    const Stable = IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Vec(Like)));
    const Likes = IDL.Service({
        count: IDL.Func([IDL.Principal, TokenIndex], [IDL.Nat], ['query']),
        dump: IDL.Func([], [Stable], ['query']),
        get: IDL.Func(
            [IDL.Opt(IDL.Principal)],
            [IDL.Opt(IDL.Vec(Like))],
            ['query']
        ),
        like: IDL.Func([IDL.Principal, TokenIndex], [], []),
        purge: IDL.Func([], [], []),
        unlike: IDL.Func([IDL.Principal, TokenIndex], [], []),
    });
    return Likes;
};
