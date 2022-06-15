import { QueryClient } from 'react-query';
import { createWebStoragePersistor } from 'react-query/createWebStoragePersistor-experimental';
import { persistQueryClient } from 'react-query/persistQueryClient-experimental';
import { deserialize, serialize } from './util/serialize';

// TODO: Configurable query client
export const queryClient = new QueryClient();

const localStoragePersistor = createWebStoragePersistor({
    storage: window.localStorage,
    serialize,
    deserialize,
});

persistQueryClient({
    queryClient,
    persistor: localStoragePersistor,
});
