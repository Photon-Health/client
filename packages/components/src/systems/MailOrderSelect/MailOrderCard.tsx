import Card from '../../particles/Card';

interface MailOrderCardProps {
  pharmacyId: string;
}

export function MailOrderCard(props: MailOrderCardProps) {
  return <Card>{props.pharmacyId}</Card>;
}
