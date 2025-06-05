import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styles from "./Block.module.scss";


export default function Switch2Way({
  x = 0,
  y = 0,
  value = 0,
  textPosOffsetX = 48*7/10,
  textPosOffsetY = 0,
  anchor = 'left',
  label = ""
}) {
  const [valueState, setValue] = useState(value);

  // Block size
  const width = 48;
  const height = 48;
  
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
    if (typeof value === 'number') {
      setValue(Number(value));
    } else {
      setValue(value);
    }
  }, [value]);



  const ID = "Switch2Way" + Math.trunc(Math.random()*1000) + Math.trunc(Math.random()*1000);


  return(
    <g transform={`translate(${offsetX} ${offsetY})`}>
      <defs>
        <g id={ID}>
          <rect width={width} height={height} rx={8} fill="transparent" />
              <line x1={0} y1={height/2} x2={width/6} y2={height/2} />
              <line x1={width/2} y1={0} x2={width/2} y2={height/6} />
              <line x1={width} y1={height/2} x2={width*5/6} y2={height/2} />
              { valueState === true ? (
                <line x1={width/2} y1={height/6} x2={width*5/6} y2={height/2} />  
              ) : (
                <line x1={width/6} y1={height/2} x2={width*5/6} y2={height/2} />
              )}
        </g>
      </defs>
      <use href={`#${ID}`} x={x} y={y} width={width} height={height} className={styles.blockGroup} />
      <text x={x + textPosOffsetX} y={y - height/5 + textPosOffsetY} className={styles.blockLabel}>{label}</text>
    </g>
  )
}

Switch2Way.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  textPosOffsetX: PropTypes.number,
  textPosOffsetY: PropTypes.number,
  value: PropTypes.oneOfType([
    PropTypes.number
  ]),
  label: PropTypes.string
}