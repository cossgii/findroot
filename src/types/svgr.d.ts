declare module '*.svg' {
  import React from 'react';
  const SVG: React.ForwardRefExoticComponent<
    React.SVGProps<SVGSVGElement> & React.RefAttributes<SVGSVGElement>
  >;
  export default SVG;
}
