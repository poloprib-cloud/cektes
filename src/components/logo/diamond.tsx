import { SVGProps } from "react";

const LogoDiamond = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <polygon
      points="50,5 95,35 75,90 25,90 5,35"
      stroke="black"
      strokeWidth="4"
      fill="lightblue"
    />
    <line x1="50" y1="5" x2="25" y2="90" stroke="black" strokeWidth="2" />
    <line x1="50" y1="5" x2="75" y2="90" stroke="black" strokeWidth="2" />
    <line x1="5" y1="35" x2="95" y2="35" stroke="black" strokeWidth="2" />
    <line x1="25" y1="90" x2="75" y2="90" stroke="black" strokeWidth="2" />
  </svg>
);

export default LogoDiamond;