import { For, JSXElement } from 'solid-js';

export type TableProps = {
  headers: string[];
  rows: JSXElement[][];
};

export default function Table(props: TableProps) {
  return (
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="mt-8 flow-root">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table class="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <For each={props.headers}>
                    {(header) => (
                      <th
                        scope="col"
                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        {header}
                      </th>
                    )}
                  </For>
                </tr>
              </thead>
              <tbody class="bg-white">
                <For each={props.rows}>
                  {(row) => (
                    <tr class="even:bg-gray-50">
                      <For each={row}>{(cell) => <td class="px-3 py-4 text-sm">{cell}</td>}</For>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
