import { JSXElement } from 'solid-js';

const Header = (props: { children?: JSXElement }) => (
  <thead>
    <tr>{props.children}</tr>
  </thead>
);

type ColProps = {
  children?: JSXElement;
  width?: string;
};

const Col = (props: ColProps) => {
  const style = { 'max-width': props?.width || 'auto' };
  return (
    <th class="px-3 py-3.5 text-left text-xs font-semibold text-gray-900" style={style}>
      {props.children}
    </th>
  );
};

const Body = (props: { children: JSXElement }) => <tbody class="bg-white">{props.children}</tbody>;

const Row = (props: { children: JSXElement }) => <tr class="even:bg-gray-50">{props.children}</tr>;

type CellProps = {
  children: JSXElement;
  width?: string;
};

const Cell = (props: CellProps) => {
  const style = { 'max-width': props?.width || 'auto' };
  return (
    <td class="px-3 py-4 text-xs" style={style}>
      {props.children}
    </td>
  );
};

export type TableProps = { children: JSXElement[] };
function Table(props: TableProps) {
  return (
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="flow-root">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle">
            <table class="min-w-full divide-y divide-gray-300">{props.children}</table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Header
Table.Header = Header;
Table.Col = Col;

// Body
Table.Body = Body;
Table.Row = Row;
Table.Cell = Cell;

export default Table;
