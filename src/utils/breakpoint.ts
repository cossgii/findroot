import tailwindConfig from '~/tailwind.config';

export function getBreakpoints(): Record<string, number> {
  const screens = tailwindConfig.theme?.screens || {};
  const customScreens = ['mobile', 'tablet', 'desktop'];
  const breakpoints: Record<string, number> = {};

  Object.entries(screens).forEach(([key, value]) => {
    if (customScreens.includes(key)) {
      const pxValue = parseInt(value.toString().replace('px', ''), 10);
      if (!isNaN(pxValue)) {
        breakpoints[key] = pxValue;
      }
    }
  });

  breakpoints['mobile'] = 0;
  return breakpoints;
}
