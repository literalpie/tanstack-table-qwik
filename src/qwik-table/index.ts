import {
  NoSerialize,
  noSerialize,
  useStore,
  useTask$,
  $,
  QRL,
  implicit$FirstArg,
} from "@builder.io/qwik";
import {
  TableOptions,
  createTable,
  Table,
  TableState,
} from "@tanstack/table-core";

interface QwikTableState<T> {
  /** The table instance - Should not be referenced directly! Use `getTable` to get a table object from this state. */
  _table?: NoSerialize<Table<T>>;
  state?: TableState;
}

/**
 * Use this to make a hook and table getter with specific options.
 * The hook and getter should be exported from your file so that they can be referenced inside your components.
 */
export const getTableHelpers = <T, U>(optionsQ: QRL<TableOptions<T>>) => {
  const getTable = $(async (qTableState: QwikTableState<T>) => {
    const options = await optionsQ.resolve();
    if (qTableState._table) {
      console.info("get table with a table that already existed");
      return qTableState._table;
    }
    console.info("getTable had to make a new table");
    const resolvedOptions = {
      onStateChange: () => {},
      renderFallbackValue: "fallback",
      ...options,
      state: { ...options.state, ...qTableState.state },
    };

    const table = createTable(resolvedOptions);
    const initialState = table.initialState;
    table.setOptions((prev) => ({
      ...prev,
      state: { ...initialState, ...resolvedOptions.state },
      onStateChange: (updater) => {
        if (typeof updater === "function") {
          qTableState.state = updater(qTableState.state!);
        } else {
          qTableState.state = updater; // Not tested
        }
      },
    }));
    qTableState._table = noSerialize(table);
    qTableState.state = { ...initialState, ...resolvedOptions.state };
    return table;
  });

  const useTable = () => {
    const qTableState = useStore<QwikTableState<T>>({});
    useTask$(({ track }) => {
      track(() => qTableState.state);
      if (!qTableState._table) {
        console.log("no table in track");
        getTable(qTableState);
      } else {
        console.log("table");
      }
      console.log("table exists");
      qTableState._table?.setOptions((prev) => {
        console.log("setting options");
        return {
          ...prev,
          state: { ...qTableState.state },
          onStateChange: (updater) => {
            console.log("state change");
            if (typeof updater === "function") {
              qTableState.state = updater(qTableState.state!);
            } else {
              qTableState.state = updater; // Not tested
            }
          },
        };
      });
    });
    return qTableState;
  };

  // I think getTable doesn't need to be serialized as long as it gets exported by the consumer?
  return {
    /** Use this to get a reference to the table object.
     * It will reuse the existing table object in the state if one exists,
     * or create a new one if needed.
     */
    getTable,
    /** Returns a table state that stays in sync with the table object returned by getTable. */
    useTable,
  };
};
