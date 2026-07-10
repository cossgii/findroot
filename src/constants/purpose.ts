import { RoutePurpose } from '@prisma/client';

export type PurposeSelection = RoutePurpose | 'ALL';

export const PURPOSE_MAP: Record<
  RoutePurpose,
  { title: string; description: string }
> = {
  FAMILY: { title: '가족', description: '가족과 함께하기 좋은 루트' },
  GATHERING: { title: '모임', description: '친구, 동료와 모임하기 좋은 루트' },
  SOLO: { title: '나홀로', description: '혼자서 즐기기 좋은 루트' },
  COUPLE: { title: '커플', description: '연인과 데이트하기 좋은 루트' },
};

export const PURPOSE_OPTIONS = (
  Object.keys(PURPOSE_MAP) as RoutePurpose[]
).map((key) => ({
  id: key as PurposeSelection,
  name: PURPOSE_MAP[key].title,
}));

export const ALL_PURPOSE_OPTION = { id: 'ALL' as PurposeSelection, name: '전체' };

export const PURPOSE_OPTIONS_WITH_ALL = [ALL_PURPOSE_OPTION, ...PURPOSE_OPTIONS];

export const PURPOSE_FORM_OPTIONS = PURPOSE_OPTIONS;
