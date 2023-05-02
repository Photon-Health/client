export interface DoseCalculatorProps {
    open: boolean;
    setClose: () => {};
    medication?: string;
}
export default function DoseCalculator(props: DoseCalculatorProps): import("solid-js").JSX.Element;
