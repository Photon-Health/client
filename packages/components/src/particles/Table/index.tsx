import { JSXElement } from 'solid-js';

const Header = (props: { children?: JSXElement }) => (
  <thead>
    <tr>{props.children}</tr>
  </thead>
);

const Col = (props: { children?: JSXElement }) => {
  return (
    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{props.children}</th>
  );
};

const Body = (props: { children: JSXElement }) => <tbody class="bg-white">{props.children}</tbody>;

const Row = (props: { children: JSXElement }) => <tr class="even:bg-gray-50">{props.children}</tr>;

const Cell = (props: { children: JSXElement }) => (
  <td class="px-3 py-4 text-sm">{props.children}</td>
);

function Table(props: { children: JSXElement[] }) {
  return (
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="mt-8 flow-root">
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
