import { SeoulMap } from '~/src/components/common/SeoulMap';

export default function Page() {
  return (
    <div className="h-[calc(100vh-var(--height-header))] w-full">
      <SeoulMap />
    </div>
  );
}
