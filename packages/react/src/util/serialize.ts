// JSON serialization support for Luxon, Principal, etc.

import { Principal } from '@dfinity/principal';
import { DateTime } from 'luxon';

// Prevent default DateTime string serialization
// @ts-ignore
DateTime.prototype.toJSON = undefined;

export function serialize(value: any): string {
    return JSON.stringify(value, (key, value) => {
        // Serialize Principal
        if (value?._isPrincipal) {
            return {
                _isPrincipal: true,
                value: value.toText(),
            };
        }

        // Serialize DateTime
        if (value?.isLuxonDateTime) {
            return {
                isLuxonDateTime: true,
                value: value.toISO(),
            };
        }

        return value;
    });
}

export function deserialize(text: string) {
    return JSON.parse(text, (key, value) => {
        // Deserialize Principal
        if (value?._isPrincipal) {
            return Principal.fromText(value.value);
        }

        // Deerialize DateTime
        if (value?.isLuxonDateTime) {
            return DateTime.fromISO(value.value);
        }

        return value;
    });
}
