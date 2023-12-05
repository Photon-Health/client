import Icon from '../Icon';

export type BannerProps = {
  text: string;
  status: 'success' | 'info';
};

export default function Banner(props: BannerProps) {
  return (
    <div class="text-blue-600 flex items-center gap-2 bg-blue-50 py-3 px-3 sm:px-4 rounded-lg">
      <div class="flex-shrink-0">
        <Icon name="informationCircle" size="sm" />
      </div>
      <span>{props.text}</span>
    </div>
  );
}
