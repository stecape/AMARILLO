import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styles from "./Block.module.scss";


export default function TestPoint({
  x = 0,
  y = 0,
  light = false,
  textPosOffsetX = 0,
  textPosOffsetY = 0,
  value = "",
  label = "",
  ...props
}) {
  const [toggle, setToggle] = useState(false);
  const [lightState, setLight] = useState(light);
  const [valueState, setValue] = useState(value);
  // Block size
  const width = 60;
  const height = 60;

  useEffect(() => {
    setLight(light);
  }, [light]);



  const ID = "TestPoint" + Math.trunc(Math.random()*1000) + Math.trunc(Math.random()*1000);

  return(
    <g>
      <defs>
        <g id={ID}>
          <rect width={width} height={height} fill="transparent" />
          <line x1="0" y1="0" x2={width} y2={height} />
          <line x1="0" y1={height} x2={width} y2="0" />
        </g>
      </defs>
      <use href={`#${ID}`} x={x} y={y} width={width} height={height} className={styles.blockGroup} />
      { toggle && <text x={x + textPosOffsetX} y={y+ height/6*8 + textPosOffsetY} className={styles.blockValue}>{valueState}</text> }
      { toggle && <text x={x + textPosOffsetX} y={y - height/5 + textPosOffsetY} className={styles.blockLabel}>{label}</text> }
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
    PropTypes.string,
    PropTypes.bool
  ]),
  label: PropTypes.string
}



//      <rect x={x} y={y} width={width} height={height} rx={10} fill="none" stroke="var(--rmd-theme-primary)"  cursor="pointer" strokeWidth={3} onClick={() => setToggle(!toggle)} />
