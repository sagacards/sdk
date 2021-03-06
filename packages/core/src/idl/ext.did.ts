import { IDL } from '@dfinity/candid';

export const idlFactory: IDL.InterfaceFactory = ({ IDL }) => {
    const TokenIdentifier = IDL.Text;
    const AccountIdentifier = IDL.Text;
    const User = IDL.Variant({
        principal: IDL.Principal,
        address: AccountIdentifier,
    });
    const Request__1 = IDL.Record({
        token: TokenIdentifier,
        owner: User,
        spender: IDL.Principal,
    });
    const Balance = IDL.Nat;
    const CommonError = IDL.Variant({
        InvalidToken: TokenIdentifier,
        Other: IDL.Text,
    });
    const Response__1 = IDL.Variant({ ok: Balance, err: CommonError });
    const SubAccount = IDL.Vec(IDL.Nat8);
    const ApproveRequest = IDL.Record({
        token: TokenIdentifier,
        subaccount: IDL.Opt(SubAccount),
        allowance: Balance,
        spender: IDL.Principal,
    });
    const Asset = IDL.Record({
        contentType: IDL.Text,
        payload: IDL.Vec(IDL.Vec(IDL.Nat8)),
    });
    const Tag = IDL.Text;
    const FilePath = IDL.Text;
    const Meta = IDL.Record({
        name: IDL.Text,
        tags: IDL.Vec(Tag),
        description: IDL.Text,
        filename: FilePath,
    });
    const Record = IDL.Record({ asset: Asset, meta: Meta });
    const Color = IDL.Record({
        background: IDL.Text,
        base: IDL.Text,
        name: IDL.Text,
        specular: IDL.Text,
        emissive: IDL.Text,
    });
    const CardStock = IDL.Record({
        base: IDL.Text,
        name: IDL.Text,
        specular: IDL.Text,
        emissive: IDL.Text,
        material: IDL.Text,
    });
    const State = IDL.Record({
        assets: IDL.Vec(Record),
        colors: IDL.Vec(Color),
        stockColors: IDL.Vec(CardStock),
    });
    const Result = IDL.Variant({ ok: IDL.Null, err: IDL.Text });
    const ICP = IDL.Record({ e8s: IDL.Nat64 });
    const BearerResponse = IDL.Variant({
        ok: AccountIdentifier,
        err: CommonError,
    });
    const Metadata = IDL.Record({
        ink: IDL.Text,
        normal: IDL.Text,
        back: IDL.Text,
        mask: IDL.Text,
        border: IDL.Text,
        stock: IDL.Text,
    });
    const TokenIndex = IDL.Nat32;
    const Time = IDL.Int;
    const Listing = IDL.Record({
        subaccount: IDL.Opt(SubAccount),
        locked: IDL.Opt(Time),
        seller: IDL.Principal,
        price: IDL.Nat64,
    });
    const DetailsResponse = IDL.Variant({
        ok: IDL.Tuple(AccountIdentifier, IDL.Opt(Listing)),
        err: CommonError,
    });
    const Transaction = IDL.Record({
        id: IDL.Nat,
        to: AccountIdentifier,
        closed: IDL.Opt(Time),
        token: TokenIdentifier,
        initiated: Time,
        from: AccountIdentifier,
        memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
        seller: IDL.Principal,
        bytes: IDL.Vec(IDL.Nat8),
        price: IDL.Nat64,
    });
    const Backup = IDL.Record({
        lowestPriceSale: IDL.Opt(IDL.Nat64),
        highestPriceSale: IDL.Opt(IDL.Nat64),
        totalVolume: IDL.Opt(IDL.Nat64),
        listings: IDL.Opt(IDL.Vec(IDL.Tuple(TokenIndex, Listing))),
        nextSubAccount: IDL.Opt(IDL.Nat),
        transactions: IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Nat, Transaction))),
        pendingDisbursements: IDL.Opt(
            IDL.Vec(
                IDL.Tuple(TokenIndex, AccountIdentifier, SubAccount, IDL.Nat64)
            )
        ),
        pendingTransactions: IDL.Opt(
            IDL.Vec(IDL.Tuple(TokenIndex, Transaction))
        ),
        _usedPaymentAddresses: IDL.Opt(
            IDL.Vec(IDL.Tuple(AccountIdentifier, IDL.Principal, SubAccount))
        ),
    });
    const GetLogMessagesFilter = IDL.Record({
        analyzeCount: IDL.Nat32,
        messageRegex: IDL.Opt(IDL.Text),
        messageContains: IDL.Opt(IDL.Text),
    });
    const Nanos = IDL.Nat64;
    const GetLogMessagesParameters = IDL.Record({
        count: IDL.Nat32,
        filter: IDL.Opt(GetLogMessagesFilter),
        fromTimeNanos: IDL.Opt(Nanos),
    });
    const GetLatestLogMessagesParameters = IDL.Record({
        upToTimeNanos: IDL.Opt(Nanos),
        count: IDL.Nat32,
        filter: IDL.Opt(GetLogMessagesFilter),
    });
    const CanisterLogRequest = IDL.Variant({
        getMessagesInfo: IDL.Null,
        getMessages: GetLogMessagesParameters,
        getLatestMessages: GetLatestLogMessagesParameters,
    });
    const CanisterLogFeature = IDL.Variant({
        filterMessageByContains: IDL.Null,
        filterMessageByRegex: IDL.Null,
    });
    const CanisterLogMessagesInfo = IDL.Record({
        features: IDL.Vec(IDL.Opt(CanisterLogFeature)),
        lastTimeNanos: IDL.Opt(Nanos),
        count: IDL.Nat32,
        firstTimeNanos: IDL.Opt(Nanos),
    });
    const LogMessagesData = IDL.Record({
        timeNanos: Nanos,
        message: IDL.Text,
    });
    const CanisterLogMessages = IDL.Record({
        data: IDL.Vec(LogMessagesData),
        lastAnalyzedMessageTimeNanos: IDL.Opt(Nanos),
    });
    const CanisterLogResponse = IDL.Variant({
        messagesInfo: CanisterLogMessagesInfo,
        messages: CanisterLogMessages,
    });
    const MetricsGranularity = IDL.Variant({
        hourly: IDL.Null,
        daily: IDL.Null,
    });
    const GetMetricsParameters = IDL.Record({
        dateToMillis: IDL.Nat,
        granularity: MetricsGranularity,
        dateFromMillis: IDL.Nat,
    });
    const UpdateCallsAggregatedData = IDL.Vec(IDL.Nat64);
    const CanisterHeapMemoryAggregatedData = IDL.Vec(IDL.Nat64);
    const CanisterCyclesAggregatedData = IDL.Vec(IDL.Nat64);
    const CanisterMemoryAggregatedData = IDL.Vec(IDL.Nat64);
    const HourlyMetricsData = IDL.Record({
        updateCalls: UpdateCallsAggregatedData,
        canisterHeapMemorySize: CanisterHeapMemoryAggregatedData,
        canisterCycles: CanisterCyclesAggregatedData,
        canisterMemorySize: CanisterMemoryAggregatedData,
        timeMillis: IDL.Int,
    });
    const NumericEntity = IDL.Record({
        avg: IDL.Nat64,
        max: IDL.Nat64,
        min: IDL.Nat64,
        first: IDL.Nat64,
        last: IDL.Nat64,
    });
    const DailyMetricsData = IDL.Record({
        updateCalls: IDL.Nat64,
        canisterHeapMemorySize: NumericEntity,
        canisterCycles: NumericEntity,
        canisterMemorySize: NumericEntity,
        timeMillis: IDL.Int,
    });
    const CanisterMetricsData = IDL.Variant({
        hourly: IDL.Vec(HourlyMetricsData),
        daily: IDL.Vec(DailyMetricsData),
    });
    const CanisterMetrics = IDL.Record({ data: CanisterMetricsData });
    const Metadata__1 = IDL.Variant({
        fungible: IDL.Record({
            decimals: IDL.Nat8,
            metadata: IDL.Opt(IDL.Vec(IDL.Nat8)),
            name: IDL.Text,
            symbol: IDL.Text,
        }),
        nonfungible: IDL.Record({ metadata: IDL.Opt(IDL.Vec(IDL.Nat8)) }),
    });
    const HeaderField = IDL.Tuple(IDL.Text, IDL.Text);
    const Request = IDL.Record({
        url: IDL.Text,
        method: IDL.Text,
        body: IDL.Vec(IDL.Nat8),
        headers: IDL.Vec(HeaderField),
    });
    const StreamingCallbackToken = IDL.Record({
        key: IDL.Text,
        index: IDL.Nat,
        content_encoding: IDL.Text,
    });
    const StreamingCallbackResponse = IDL.Record({
        token: IDL.Opt(StreamingCallbackToken),
        body: IDL.Vec(IDL.Nat8),
    });
    const StreamingCallback = IDL.Func(
        [StreamingCallbackToken],
        [StreamingCallbackResponse],
        ['query']
    );
    const StreamingStrategy = IDL.Variant({
        Callback: IDL.Record({
            token: StreamingCallbackToken,
            callback: StreamingCallback,
        }),
    });
    const Response = IDL.Record({
        body: IDL.Vec(IDL.Nat8),
        headers: IDL.Vec(HeaderField),
        streaming_strategy: IDL.Opt(StreamingStrategy),
        status_code: IDL.Nat16,
    });
    const EventName = IDL.Text;
    const Spots = IDL.Opt(IDL.Int);
    const Allowlist = IDL.Vec(IDL.Tuple(IDL.Principal, Spots));
    const Access = IDL.Variant({ Private: Allowlist, Public: IDL.Null });
    const URL = IDL.Text;
    const CollectionDetails = IDL.Record({
        descriptionMarkdownUrl: URL,
        iconImageUrl: URL,
        bannerImageUrl: URL,
        previewImageUrl: URL,
    });
    const Tokens = IDL.Record({ e8s: IDL.Nat64 });
    const Data = IDL.Record({
        startsAt: Time,
        name: EventName,
        description: IDL.Text,
        accessType: Access,
        details: CollectionDetails,
        price: Tokens,
        endsAt: Time,
    });
    const Error = IDL.Variant({
        NotInAllowlist: IDL.Null,
        TokenNotFound: IDL.Principal,
        IndexNotFound: IDL.Nat,
        AlreadyOver: Time,
        NotStarted: Time,
    });
    const Result__1 = IDL.Variant({ ok: IDL.Null, err: Error });
    const BlockIndex = IDL.Nat64;
    const TransferError = IDL.Variant({
        TxTooOld: IDL.Record({ allowed_window_nanos: IDL.Nat64 }),
        BadFee: IDL.Record({ expected_fee: Tokens }),
        TxDuplicate: IDL.Record({ duplicate_of: BlockIndex }),
        TxCreatedInFuture: IDL.Null,
        InsufficientFunds: IDL.Record({ balance: Tokens }),
    });
    const MintError = IDL.Variant({
        NoneAvailable: IDL.Null,
        Refunded: IDL.Null,
        TryCatchTrap: IDL.Text,
        NoMintingSpot: IDL.Null,
        Transfer: TransferError,
        Events: Error,
    });
    const Result_6 = IDL.Variant({ ok: IDL.Nat, err: MintError });
    const ListRequest = IDL.Record({
        token: TokenIdentifier,
        from_subaccount: IDL.Opt(SubAccount),
        price: IDL.Opt(IDL.Nat64),
    });
    const ListResponse = IDL.Variant({ ok: IDL.Null, err: CommonError });
    const ExtListing = IDL.Record({
        locked: IDL.Opt(Time),
        seller: IDL.Principal,
        price: IDL.Nat64,
    });
    const Metadata__2 = IDL.Variant({
        fungible: IDL.Record({
            decimals: IDL.Nat8,
            metadata: IDL.Opt(IDL.Vec(IDL.Nat8)),
            name: IDL.Text,
            symbol: IDL.Text,
        }),
        nonfungible: IDL.Record({ metadata: IDL.Opt(IDL.Vec(IDL.Nat8)) }),
    });
    const ListingsResponse = IDL.Vec(
        IDL.Tuple(TokenIndex, ExtListing, Metadata__2)
    );
    const LockResponse = IDL.Variant({
        ok: AccountIdentifier,
        err: CommonError,
    });
    const MetadataResponse = IDL.Variant({
        ok: Metadata__1,
        err: CommonError,
    });
    const Result_5 = IDL.Variant({ ok: IDL.Nat, err: IDL.Text });
    const Memo__1 = IDL.Nat64;
    const BlockIndex__1 = IDL.Nat64;
    const TransferError__1 = IDL.Variant({
        TxTooOld: IDL.Record({ allowed_window_nanos: IDL.Nat64 }),
        BadFee: IDL.Record({ expected_fee: ICP }),
        TxDuplicate: IDL.Record({ duplicate_of: BlockIndex__1 }),
        TxCreatedInFuture: IDL.Null,
        InsufficientFunds: IDL.Record({ balance: ICP }),
    });
    const TransferResult__1 = IDL.Variant({
        Ok: BlockIndex__1,
        Err: TransferError__1,
    });
    const TxId = IDL.Nat32;
    const TokenIndex__1 = IDL.Nat32;
    const BlockHeight = IDL.Nat64;
    const Purchase = IDL.Record({
        id: TxId,
        token: TokenIndex__1,
        buyerAccount: IDL.Text,
        memo: IDL.Nat64,
        blockheight: BlockHeight,
        closedAt: Time,
        lockedAt: Time,
        buyer: IDL.Principal,
        price: IDL.Nat64,
    });
    const NNSTransaction = IDL.Record({
        from: IDL.Text,
        memo: IDL.Nat64,
        blockheight: IDL.Nat64,
        timestamp: Time,
        amount: IDL.Nat64,
    });
    const Refund = IDL.Record({
        id: TxId,
        buyer: IDL.Text,
        transactions: IDL.Record({
            original: NNSTransaction,
            refund: NNSTransaction,
        }),
    });
    const Disbursement = IDL.Tuple(
        TokenIndex,
        AccountIdentifier,
        SubAccount,
        IDL.Nat64
    );
    const Token = IDL.Record({
        owner: AccountIdentifier,
        createdAt: IDL.Int,
        txId: IDL.Text,
    });
    const LegendManifest = IDL.Record({
        ink: Tag,
        nri: IDL.Record({
            avg: IDL.Float64,
            ink: IDL.Float64,
            back: IDL.Float64,
            border: IDL.Float64,
        }),
        views: IDL.Record({
            interactive: FilePath,
            flat: FilePath,
            animated: FilePath,
            sideBySide: FilePath,
        }),
        back: Tag,
        maps: IDL.Record({
            normal: FilePath,
            back: FilePath,
            mask: IDL.Opt(FilePath),
            layers: IDL.Vec(FilePath),
            border: FilePath,
        }),
        mask: Tag,
        border: Tag,
        stock: Tag,
        colors: IDL.Record({
            background: IDL.Text,
            base: IDL.Text,
            specular: IDL.Text,
            emissive: IDL.Text,
        }),
        stockColors: IDL.Record({
            base: IDL.Text,
            specular: IDL.Text,
            emissive: IDL.Text,
            material: IDL.Text,
        }),
    });
    const Result_4 = IDL.Variant({ ok: LegendManifest, err: IDL.Text });
    const Result_3 = IDL.Variant({ ok: IDL.Null, err: CommonError });
    const Result_2 = IDL.Variant({
        ok: IDL.Vec(TokenIndex),
        err: CommonError,
    });
    const LocalStableState = IDL.Record({
        metadata: IDL.Vec(Metadata),
        tokens: IDL.Vec(IDL.Opt(Token)),
        isShuffled: IDL.Bool,
    });
    const Result_1 = IDL.Variant({
        ok: IDL.Vec(
            IDL.Tuple(TokenIndex, IDL.Opt(Listing), IDL.Opt(IDL.Vec(IDL.Nat8)))
        ),
        err: CommonError,
    });
    const EntrepotTransaction = IDL.Record({
        token: TokenIdentifier,
        time: Time,
        seller: IDL.Principal,
        buyer: AccountIdentifier,
        price: IDL.Nat64,
    });
    const Memo = IDL.Vec(IDL.Nat8);
    const TransferRequest = IDL.Record({
        to: User,
        token: TokenIdentifier,
        notify: IDL.Bool,
        from: User,
        memo: Memo,
        subaccount: IDL.Opt(SubAccount),
        amount: Balance,
    });
    const TransferResponse = IDL.Variant({
        ok: Balance,
        err: IDL.Variant({
            CannotNotify: AccountIdentifier,
            InsufficientBalance: IDL.Null,
            InvalidToken: TokenIdentifier,
            Rejected: IDL.Null,
            Unauthorized: AccountIdentifier,
            Other: IDL.Text,
        }),
    });
    const TransferResult = IDL.Variant({
        Ok: BlockIndex,
        Err: TransferError,
    });
    const LegendsNFT = IDL.Service({
        address: IDL.Func([], [IDL.Vec(IDL.Nat8), IDL.Text], ['query']),
        allowance: IDL.Func([Request__1], [Response__1], []),
        approve: IDL.Func([ApproveRequest], [], []),
        balance: IDL.Func([], [ICP], []),
        bearer: IDL.Func([TokenIdentifier], [BearerResponse], ['query']),
        details: IDL.Func([TokenIdentifier], [DetailsResponse], ['query']),
        getRegistry: IDL.Func(
            [],
            [IDL.Vec(IDL.Tuple(TokenIndex, AccountIdentifier))],
            ['query']
        ),
        getTokens: IDL.Func(
            [],
            [IDL.Vec(IDL.Tuple(TokenIndex, Metadata__1))],
            ['query']
        ),
        http_request: IDL.Func([Request], [Response], ['query']),
        list: IDL.Func([ListRequest], [ListResponse], []),
        listings: IDL.Func([], [ListingsResponse], ['query']),
        lock: IDL.Func(
            [TokenIdentifier, IDL.Nat64, AccountIdentifier, IDL.Vec(IDL.Nat8)],
            [LockResponse],
            []
        ),
        metadata: IDL.Func([TokenIdentifier], [MetadataResponse], ['query']),
        mint: IDL.Func([User], [Result_5], []),
        payments: IDL.Func([], [IDL.Opt(IDL.Vec(SubAccount))], ['query']),
        settle: IDL.Func([TokenIdentifier], [Result_3], []),
        stats: IDL.Func(
            [],
            [
                IDL.Nat64,
                IDL.Nat64,
                IDL.Nat64,
                IDL.Nat64,
                IDL.Nat,
                IDL.Nat,
                IDL.Nat,
            ],
            ['query']
        ),
        tokenId: IDL.Func([TokenIndex], [TokenIdentifier], ['query']),
        tokens: IDL.Func([AccountIdentifier], [Result_2], ['query']),
        tokens_ext: IDL.Func([AccountIdentifier], [Result_1], ['query']),
        transactions: IDL.Func([], [IDL.Vec(EntrepotTransaction)], ['query']),
        transfer: IDL.Func([TransferRequest], [TransferResponse], []),
    });
    return LegendsNFT;
};
