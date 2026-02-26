interface MedicationSearchGroupLabelProps {
  label: string;
  sticky?: boolean;
}

export default function MedicationSearchGroupLabel(props: MedicationSearchGroupLabelProps) {
  return (
    <div
      role="presentation"
      class={`bg-blue-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700 ${
        props.sticky ? 'sticky top-0 z-10' : ''
      }`}
    >
      {props.label}
    </div>
  );
}