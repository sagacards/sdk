import { IDL } from '@dfinity/candid';
export const idlFactory: IDL.InterfaceFactory = ({ IDL }) => {
    const DetailValue = IDL.Rec();
    DetailValue.fill(
        IDL.Variant({
            I64: IDL.Int64,
            U64: IDL.Nat64,
            Vec: IDL.Vec(DetailValue),
            Slice: IDL.Vec(IDL.Nat8),
            Text: IDL.Text,
            True: IDL.Null,
            False: IDL.Null,
            Float: IDL.Float64,
            Principal: IDL.Principal,
        })
    );
    const Metadata = IDL.Record({
        thumbnail: IDL.Text,
        name: IDL.Text,
        frontend: IDL.Opt(IDL.Text),
        description: IDL.Text,
        details: IDL.Vec(IDL.Tuple(IDL.Text, DetailValue)),
        principal_id: IDL.Principal,
    });
    const Error = IDL.Variant({
        NotAuthorized: IDL.Null,
        BadParameters: IDL.Null,
        Unknown: IDL.Text,
        NonExistentItem: IDL.Null,
    });
    const Response = IDL.Variant({ Ok: IDL.Opt(IDL.Text), Err: Error });
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
    const TarotDAB = IDL.Service({
        add: IDL.Func([Metadata], [Response], []),
        addAdmin: IDL.Func([IDL.Principal], [], []),
        adds: IDL.Func([IDL.Vec(Metadata)], [Response], []),
        collectCanisterMetrics: IDL.Func([], [], []),
        get: IDL.Func([IDL.Principal], [IDL.Opt(Metadata)], ['query']),
        getAdmins: IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
        getAll: IDL.Func([], [IDL.Vec(Metadata)], ['query']),
        getCanisterLog: IDL.Func(
            [IDL.Opt(CanisterLogRequest)],
            [IDL.Opt(CanisterLogResponse)],
            ['query']
        ),
        getCanisterMetrics: IDL.Func(
            [GetMetricsParameters],
            [IDL.Opt(CanisterMetrics)],
            ['query']
        ),
        isAdmin: IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
        name: IDL.Func([], [IDL.Text], ['query']),
        ping: IDL.Func([], [IDL.Text], ['query']),
        remove: IDL.Func([IDL.Principal], [Response], []),
        removeAdmin: IDL.Func([IDL.Principal], [], []),
    });
    return TarotDAB;
};
