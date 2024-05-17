import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import SkylineModel from "./github";

const Download = ({ onClick }: { onClick: () => void }) => (
  <svg
    width='80px'
    height='80px'
    viewBox='0 0 15 15'
    fill='none'
    onClick={onClick}>
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M7.50005 1.04999C7.74858 1.04999 7.95005 1.25146 7.95005 1.49999V8.41359L10.1819 6.18179C10.3576 6.00605 10.6425 6.00605 10.8182 6.18179C10.994 6.35753 10.994 6.64245 10.8182 6.81819L7.81825 9.81819C7.64251 9.99392 7.35759 9.99392 7.18185 9.81819L4.18185 6.81819C4.00611 6.64245 4.00611 6.35753 4.18185 6.18179C4.35759 6.00605 4.64251 6.00605 4.81825 6.18179L7.05005 8.41359V1.49999C7.05005 1.25146 7.25152 1.04999 7.50005 1.04999ZM2.5 10C2.77614 10 3 10.2239 3 10.5V12C3 12.5539 3.44565 13 3.99635 13H11.0012C11.5529 13 12 12.5528 12 12V10.5C12 10.2239 12.2239 10 12.5 10C12.7761 10 13 10.2239 13 10.5V12C13 13.1041 12.1062 14 11.0012 14H3.99635C2.89019 14 2 13.103 2 12V10.5C2 10.2239 2.22386 10 2.5 10Z'
      fill='#000000'
    />
  </svg>
);

const Skyline = () => {
  const { username, year } = useParams();
  const skylineRef = useRef<{ download: () => void }>(null);
  if (!(username && year)) {
    return <></>;
  }
  const domain = import.meta.env.DOMAIN || "github.com";
  const [svg, setSvg] = useState<string>("");

  return (
    <div className='skyline'>
      <SkylineModel
        domain={domain}
        year={parseInt(year)}
        author={username}
        ref={skylineRef}
        svgUrl={svg}
      />
      <div className='toolbar'>
        <div className='toolbar-item'>
          <label htmlFor='svg'>import from online SVG</label>
          <input
            type='text'
            id='svg'
            style={{ backgroundColor: "pink" }}
            value={svg}
            onChange={(e) => {
              setSvg(e.target.value);
            }}
          />
        </div>
        <div className='toolbar-item'>
          <Download onClick={() => skylineRef.current?.download()} />
        </div>
      </div>
    </div>
  );
};

export default Skyline;
