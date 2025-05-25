import React from "react";
import styles from "./Block.module.scss";

/**
 * Block component for PID diagram
 * @param {Object} props
 * @param {string} props.label - The label to display above the block
 * @param {string|number} props.value - The value to display below the block
 * @param {number} props.x - The x coordinate of the anchor point (midpoint of one side)
 * @param {number} props.y - The y coordinate of the anchor point (midpoint of one side)
 * @param {string} [props.anchor] - Which anchor ('left'|'right'|'top'|'bottom'), default 'left'
 * @param {function} [props.onClick] - Optional click handler
 */
const Block = ({ label, value, x, y, anchor = 'left', onClick }) => {
  // Block size
  const width = 60;
  const height = 60;
  // Calculate top-left corner based on anchor
  let blockX = x, blockY = y;
  switch (anchor) {
    case 'left':
      blockX = x;
      blockY = y - height / 2;
      break;
    case 'right':
      blockX = x - width;
      blockY = y - height / 2;
      break;
    case 'top':
      blockX = x - width / 2;
      blockY = y;
      break;
    case 'bottom':
      blockX = x - width / 2;
      blockY = y - height;
      break;
    default:
      blockX = x;
      blockY = y - height / 2;
  }
  // Label always horizontally centered above the block
  return (
    <g className={styles.blockGroup}>
      <text x={blockX + width / 2} y={blockY - 10} textAnchor="middle" alignmentBaseline="baseline" fontSize="18" className={styles.blockLabel}>{label}</text>
      <rect x={blockX} y={blockY} width={width} height={height} rx={10} fill="rgba(255,255,255,0.18)" stroke="var(--rmd-theme-primary)" strokeWidth={3} onClick={onClick} />
      <text x={blockX + width / 2} y={blockY + height + 20} textAnchor="middle" fontSize="16" className={styles.blockValue}>{value}</text>
    </g>
  );
};

export default Block;
