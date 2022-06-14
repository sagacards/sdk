import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type CanisterCyclesAggregatedData = Array<bigint>;
export type CanisterHeapMemoryAggregatedData = Array<bigint>;
export type CanisterLogFeature =
    | { filterMessageByContains: null }
    | { filterMessageByRegex: null };
export interface CanisterLogMessages {
    data: Array<LogMessagesData>;
    lastAnalyzedMessageTimeNanos: [] | [Nanos];
}
export interface CanisterLogMessagesInfo {
    features: Array<[] | [CanisterLogFeature]>;
    lastTimeNanos: [] | [Nanos];
    count: number;
    firstTimeNanos: [] | [Nanos];
}
export type CanisterLogRequest =
    | { getMessagesInfo: null }
    | { getMessages: GetLogMessagesParameters }
    | { getLatestMessages: GetLatestLogMessagesParameters };
export type CanisterLogResponse =
    | { messagesInfo: CanisterLogMessagesInfo }
    | { messages: CanisterLogMessages };
export type CanisterMemoryAggregatedData = Array<bigint>;
export interface CanisterMetrics {
    data: CanisterMetricsData;
}
export type CanisterMetricsData =
    | { hourly: Array<HourlyMetricsData> }
    | { daily: Array<DailyMetricsData> };
export interface DailyMetricsData {
    updateCalls: bigint;
    canisterHeapMemorySize: NumericEntity;
    canisterCycles: NumericEntity;
    canisterMemorySize: NumericEntity;
    timeMillis: bigint;
}
export type DetailValue =
    | { I64: bigint }
    | { U64: bigint }
    | { Vec: Array<DetailValue> }
    | { Slice: Array<number> }
    | { Text: string }
    | { True: null }
    | { False: null }
    | { Float: number }
    | { Principal: Principal };
export type Error =
    | { NotAuthorized: null }
    | { BadParameters: null }
    | { Unknown: string }
    | { NonExistentItem: null };
export interface GetLatestLogMessagesParameters {
    upToTimeNanos: [] | [Nanos];
    count: number;
    filter: [] | [GetLogMessagesFilter];
}
export interface GetLogMessagesFilter {
    analyzeCount: number;
    messageRegex: [] | [string];
    messageContains: [] | [string];
}
export interface GetLogMessagesParameters {
    count: number;
    filter: [] | [GetLogMessagesFilter];
    fromTimeNanos: [] | [Nanos];
}
export interface GetMetricsParameters {
    dateToMillis: bigint;
    granularity: MetricsGranularity;
    dateFromMillis: bigint;
}
export interface HourlyMetricsData {
    updateCalls: UpdateCallsAggregatedData;
    canisterHeapMemorySize: CanisterHeapMemoryAggregatedData;
    canisterCycles: CanisterCyclesAggregatedData;
    canisterMemorySize: CanisterMemoryAggregatedData;
    timeMillis: bigint;
}
export interface LogMessagesData {
    timeNanos: Nanos;
    message: string;
}
export interface Metadata {
    thumbnail: string;
    name: string;
    frontend: [] | [string];
    description: string;
    details: Array<[string, DetailValue]>;
    principal_id: Principal;
}
export type MetricsGranularity = { hourly: null } | { daily: null };
export type Nanos = bigint;
export interface NumericEntity {
    avg: bigint;
    max: bigint;
    min: bigint;
    first: bigint;
    last: bigint;
}
export type Response = { Ok: [] | [string] } | { Err: Error };
export interface TarotDAB {
    add: ActorMethod<[Metadata], Response>;
    addAdmin: ActorMethod<[Principal], undefined>;
    adds: ActorMethod<[Array<Metadata>], Response>;
    collectCanisterMetrics: ActorMethod<[], undefined>;
    get: ActorMethod<[Principal], [] | [Metadata]>;
    getAdmins: ActorMethod<[], Array<Principal>>;
    getAll: ActorMethod<[], Array<Metadata>>;
    getCanisterLog: ActorMethod<
        [[] | [CanisterLogRequest]],
        [] | [CanisterLogResponse]
    >;
    getCanisterMetrics: ActorMethod<
        [GetMetricsParameters],
        [] | [CanisterMetrics]
    >;
    isAdmin: ActorMethod<[Principal], boolean>;
    name: ActorMethod<[], string>;
    ping: ActorMethod<[], string>;
    remove: ActorMethod<[Principal], Response>;
    removeAdmin: ActorMethod<[Principal], undefined>;
}
export type UpdateCallsAggregatedData = Array<bigint>;
export interface _SERVICE extends TarotDAB {}
