import { SeoulMap } from '~/src/components/common/seoul-map';

export default function Page() {
  return (
    <div className="h-[calc(100vh-var(--height-header))] w-full">
      <SeoulMap />
    </div>
  );
}
