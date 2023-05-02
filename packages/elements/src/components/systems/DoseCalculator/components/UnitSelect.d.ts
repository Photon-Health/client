export type RecordWithId<T> = {
    id: string;
    name: T;
};
declare function UnitSelect<T extends string>(props: {
    setSelected: (value: T) => void;
    options: T[];
    initialIdx?: number;
}): import("solid-js").JSX.Element;
export default UnitSelect;
