import {
  NoSerialize,
  noSerialize,
  useStore,
  useWatch$,
} from '@builder.io/qwik';
import {
  TableOptions,
  createTable,
  Table,
  TableState,
} from '@tanstack/table-core';

interface QwikTableState<T> {
  /** The table instance - Should not be referenced directly! Use `getTable` to get a table object from this state. */
  _table?: NoSerialize<Table<T>>;
  state?: TableState;
}

/**
 * Use this to make a hook and table getter with specific options.
 * The hook and getter should be exported from your file so that they can be referenced inside your components.
 */
export const getTableHelpers = <T, U>(options: TableOptions<T>) => {
  const getTable = (qTableState: QwikTableState<T>) => {
    if (qTableState._table) {
      console.info('get table with a table that already existed');
      return qTableState._table;
    }
    console.info('getTable had to make a new table');
    const resolvedOptions = {
      onStateChange: () => {},
      renderFallbackValue: 'fallback',
      ...options,
      state: { ...options.state, ...qTableState.state },
    };

    const table = createTable(resolvedOptions);
    const initialState = table.initialState;
    table.setOptions((prev) => ({
      ...prev,
      state: { ...initialState, ...resolvedOptions.state },
      onStateChange: (updater) => {
        if (typeof updater === 'function') {
          qTableState.state = updater(qTableState.state!);
        } else {
          qTableState.state = updater; // Not tested
        }
      },
    }));
    qTableState._table = noSerialize(table);
    qTableState.state = { ...initialState, ...resolvedOptions.state };

    return table;
  };

  const useTable = () => {
    const qTableState = useStore<QwikTableState<T>>({});
    useWatch$(() => {
      if (!qTableState._table) {
        getTable(qTableState);
      }
    });
    useWatch$(({ track }) => {
      track(() => qTableState.state);

      qTableState._table?.setOptions((prev) => ({
        ...prev,
        state: { ...qTableState.state },
        onStateChange: (updater) => {
          if (typeof updater === 'function') {
            qTableState.state = updater(qTableState.state!);
          } else {
            qTableState.state = updater; // Not tested
          }
        },
      }));
    });
    return qTableState;
  };

  // I think getTable doesn't need to be serialized as long as it gets exported by the consumer?
  return {
    /** Use this to get a reference to the table object.
     * It will reuse the existing table object in the state if one exists,
     * or create a new one if needed.
     */
    getTable: noSerialize(getTable)!,
    /** Returns a table state that stays in sync with the table object returned by getTable. */
    useTable,
  };
};
