import MainContainer from '~/src/components/layout/main-container';
import { SeoulMap } from '~/src/components/common/seoul-map';

export default function Page() {
  return (
    <MainContainer className="flex flex-col max-w-full px-0 items-center h-full">
      <SeoulMap />
    </MainContainer>
  );
}
