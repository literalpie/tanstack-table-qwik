import { component$, useSignal, useWatch$, $, QRL } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  Table,
  TableOptions,
} from '@tanstack/table-core';
import { getTableHelpers } from '~/qwik-table';

interface Person {
  name: string;
  age: number;
}

export const columnHelper = createColumnHelper<Person>();
export const columns = [
  columnHelper.accessor('name', {
    header: 'Name',
    enableGlobalFilter: true,
  }),
  columnHelper.accessor('age', {
    header: 'Age',
    enableGlobalFilter: false,
  }),
];

export const defaultTableOptions: TableOptions<Person> = {
  columns,
  data: [
    { name: 'Ben', age: 1 },
    { name: 'Kasey', age: 3 },
    { name: 'Bethany', age: 2 },
    { name: 'Darrell', age: 21 },
    { name: 'Greg', age: 12 },
  ],
  state: { sorting: [{ desc: true, id: 'name' }] },
  getFilteredRowModel: getFilteredRowModel(),
  onStateChange: () => {},
  renderFallbackValue: 'render fallback',
  getSortedRowModel: getSortedRowModel(),
  getCoreRowModel: getCoreRowModel(),
};

export const { getTable: getPersonTable, useTable: usePersonTable } =
  getTableHelpers(defaultTableOptions);

export default component$(() => {
  const tableState = usePersonTable();
  const table = useSignal<Table<Person>>();
  useWatch$(({ track }) => {
    track(() => tableState.state);
    table.value = getPersonTable(tableState);
  });
  // table is an object that can be mutated by calling functions, but those mutations won't trigger the signal.
  // Reference state in render function so that the table gets rerendered when state changes
  tableState.state;

  return (
    <>
      <p>
        This is the tanstack table, working in Qwik. Notice that none of the
        tanstack JS gets loaded until the first time you interact with the
        table. Radical!
      </p>
      <p>
        (Because of this, the page may reload the first time you make a change.
        This is only in development mode because of Vite)
      </p>
      <p>
        Click a table header to sort, or enter text into the input to filter.
      </p>
      <p>
        Sorting seems to reveal an issue in Qwik. See{' '}
        <a href="https://github.com/BuilderIO/qwik/issues/2414">
          this issue on GitHub
        </a>
      </p>
      <label>
        Filter{' '}
        <input
          type="text"
          onKeyUp$={(e) => {
            if (tableState.state) {
              tableState.state = {
                ...tableState.state,
                globalFilter: (e.target as HTMLInputElement).value,
              };
            }
          }}
        />
      </label>
      <table>
        <thead>
          {table.value?.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(({ column }) => {
                const id = column.id;
                return (
                  <th
                    key={id}
                    onClick$={(e) => {
                      const table = getPersonTable(tableState);
                      table.getColumn(id).getToggleSortingHandler?.()?.(e);
                    }}
                  >
                    {column.columnDef.header}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.value?.getRowModel().rows.map((row) => {
            return (
              <tr key={row.id}>
                {row.getAllCells().map((cell) => (
                  <td key={cell.id}>{cell.getValue<string>()}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
        <tfoot></tfoot>
      </table>
    </>
  );
});

export const head: DocumentHead = {
  title: 'Tanstack Qwik Table',
};
