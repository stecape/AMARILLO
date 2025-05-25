import React from "react";

/**
 * Connector component for PID diagram
 * @param {Object} props
 * @param {{x:number, y:number}} props.start - Start point (absolute coordinates)
 * @param {Array<[number, number]>} props.offsets - Array of [dx, dy] offsets
 * @param {boolean} [props.arrow] - If true, draw arrow at end
 * @param {boolean} [props.dot] - If true, draw a dot at end
 * @param {string} [props.stroke] - Stroke color
 * @param {number} [props.strokeWidth] - Stroke width
 */
const Connector = ({ start, offsets = [], arrow = false, dot = false, stroke = '#bbb', strokeWidth = 2 }) => {
  if (!start || !Array.isArray(offsets)) return null;
  // Calcola i punti assoluti a partire da start e offsets
  const points = [start];
  let last = { ...start };
  offsets.forEach(([dx, dy]) => {
    last = { x: last.x + dx, y: last.y + dy };
    points.push({ ...last });
  });
  if (points.length < 2) return null;
  const path = points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ');
  const markerEnd = arrow ? 'url(#arrow)' : dot ? 'url(#dot)' : undefined;
  return (
    <g>
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L6,3 L0,6 Z" fill={stroke} />
        </marker>
        <marker id="dot" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto" markerUnits="strokeWidth">
          <circle cx="3" cy="3" r="3" fill={stroke} />
        </marker>
      </defs>
      <path d={path} fill="none" stroke={stroke} strokeWidth={strokeWidth} markerEnd={markerEnd} />
    </g>
  );
};

export default Connector;
