import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styles from "./Block.module.scss";


export default function Saturation({
  x = 0,
  y = 0,
  light = false,
  anchor = 'left'
}) {
  const [lightState, setLight] = useState(light);
  // Block size
  const width = 96;
  const height = 96;
  
  // Calculate top-left corner based on anchor
  let offsetX = x, offsetY = y;
  switch (anchor) {
    case 'left':
      offsetX = 0;
      offsetY = -height/2;
      break;
    case 'right':
      offsetX = -width;
      offsetY = -height/2;
      break;
    case 'top':
      offsetX = -width/2;
      offsetY = 0;
      break;
    case 'bottom':
      offsetX = -width/2;
      offsetY = -height;
      break;
    default:
      offsetX = 0;
      offsetY = -height/2;
  }

  useEffect(() => {
    setLight(light);
  }, [light]);



  const ID = "TestPoint" + Math.trunc(Math.random()*1000) + Math.trunc(Math.random()*1000);

  return(
    <g transform={`translate(${offsetX} ${offsetY})`}>
      <defs>
        <g id={ID}>
          <rect width={width} height={height} rx={8} fill="transparent" />
          <line x1={width/8} y1={height*6/8} x2={width*3/8} y2={height*6/8} />
          <line x1={width*3/8} y1={height*6/8} x2={width*5/8} y2={height*2/8} />
          <line x1={width*5/8} y1={height*2/8} x2={width*7/8} y2={height*2/8} />
        </g>
      </defs>
      <use href={`#${ID}`} x={x} y={y} width={width} height={height} className={styles.blockGroup}/>
    </g>
  )
}

Saturation.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  light: PropTypes.bool
}