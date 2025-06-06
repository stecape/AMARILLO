import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styles from "./Block.module.scss";


export default function TestPoint({
  x = 0,
  y = 0,
  light = false,
  textPosOffsetX = 48*7/10,
  textPosOffsetY = 0,
  value = 0,
  anchor = 'left',
  label = "",
  Set = undefined,
  onSetClick = undefined,
  ...props
}) {
  const [lightState, setLight] = useState(light);
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
    setLight(light);
  }, [light]);

  useEffect(() => {
    // Tronca il valore a massimo 4 decimali se è un numero
    if (typeof value === 'number') {
      setValue(Number(value.toFixed(4)));
    } else {
      setValue(value);
    }
  }, [value]);



  const ID = "TestPoint" + Math.trunc(Math.random()*1000) + Math.trunc(Math.random()*1000);

  // SVG for triangle with bar
  const TriangleBarIcon = (
    <g>
      <polygon points="24,34 38,10 10,10" fill="none" stroke="var(--rmd-theme-primary)" strokeWidth="2" />
      <rect x="10" y="36" width="28" height="2" fill="var(--rmd-theme-primary)" stroke="none" />
    </g>
  );

  return(
    <g transform={`translate(${offsetX} ${offsetY})`}>
      <defs>
        <g id={ID}>
          <rect width={width} height={height} rx={8} fill="transparent" />
          {onSetClick ? TriangleBarIcon : (
            props.content ?
              <text 
                x={width/2} 
                y={height/2 + 2} 
                textAnchor="middle" 
                dominantBaseline="middle" 
                className={styles.blockContent}
              >
                {props.content}
              </text>
            :
              (<>
                <line x1={width/4} y1={height/4} x2={3*width/4} y2={3*height/4} />
                <line x1={width/4} y1={3*height/4} x2={3*width/4} y2={height/4} />
              </>)
          )}
        </g>
      </defs>
      <use href={`#${ID}`} x={x} y={y} width={width} height={height} className={onSetClick ? styles.blockGroup + ' ' + styles.clickable : styles.blockGroup}
        style={onSetClick ? { cursor: 'pointer' } : {}} onClick={onSetClick ? onSetClick : undefined} />
      <text x={x + textPosOffsetX} y={y+ height/6*9 + textPosOffsetY} className={styles.blockValue}>{valueState}</text>
      <text x={x + textPosOffsetX} y={y - height/5 + textPosOffsetY} className={styles.blockLabel}>{label}</text>
    </g>
  )
}

TestPoint.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  light: PropTypes.bool,
  textPosOffsetX: PropTypes.number,
  textPosOffsetY: PropTypes.number,
  value: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.bool
  ]),
  label: PropTypes.string
}