import "./Grid.css";
import { memo, useCallback, useState } from "react";
import { useCurrentStep } from "../../lib/useSnapshotEvent";

type GridProps = {
  data: boolean[][];
  handleChange: (args: boolean[][]) => void;
  renderHeader?: (rowIndex: number) => React.ReactNode;
  currentStep?: number;
  beatsPerBar?: number;
};

/**
 * Individual grid cell component
 * Memoized to prevent unnecessary re-renders
 */
interface GridCellProps {
  rowIndex: number;
  columnIndex: number;
  isActive: boolean;
  isPlaying: boolean;
  isBar: boolean;
  onToggle: (rowIndex: number, columnIndex: number) => void;
  onHover: (rowIndex: number, columnIndex: number) => void;
}

const GridCell = memo<GridCellProps>(
  ({
    rowIndex,
    columnIndex,
    isActive,
    isPlaying,
    isBar,
    onToggle,
    onHover,
  }) => {
    const handleMouseDown = useCallback(() => {
      onToggle(rowIndex, columnIndex);
    }, [rowIndex, columnIndex, onToggle]);

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent) => {
        if (e.buttons === 1) {
          onHover(rowIndex, columnIndex);
        }
      },
      [rowIndex, columnIndex, onHover]
    );

    return (
      <div
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        className={`grid-cell ${isActive ? "grid-cell--active" : ""} ${
          isPlaying ? "grid-cell--playing" : ""
        } ${isBar ? "grid-cell--bar" : ""}`}
      />
    );
  }
);

GridCell.displayName = "GridCell";

const Grid: React.FC<GridProps> = ({
  data,
  handleChange,
  renderHeader,
  beatsPerBar,
}) => {
  const [currentAction, setCurrentAction] = useState<boolean>();

  const currentStep = useCurrentStep();

  const handleToggle = useCallback(
    (
      selectedRowIndex: number,
      selectedColumnIndex: number,
      action?: boolean
    ) => {
      const newMatrix = data.map((row, rIdx) =>
        row.map((cell, cIdx) => {
          if (rIdx === selectedRowIndex && cIdx === selectedColumnIndex) {
            return action !== undefined ? action : !cell;
          }
          return cell;
        })
      );
      handleChange(newMatrix);
    },
    [data, handleChange]
  );

  const onCellToggle = useCallback(
    (rowIndex: number, columnIndex: number) => {
      setCurrentAction(!data[rowIndex][columnIndex]);
      handleToggle(rowIndex, columnIndex);
    },
    [data, handleToggle]
  );

  const onCellHover = useCallback(
    (rowIndex: number, columnIndex: number) => {
      handleToggle(rowIndex, columnIndex, currentAction);
    },
    [handleToggle, currentAction]
  );

  return (
    <div className="grid">
      {data.map((instrument, i) => (
        <div className="grid-row" key={`row-${i}`}>
          <div className="grid-row-header">
            {renderHeader ? renderHeader(i) : null}
          </div>
          <div className="grid-row-cells">
            {instrument.map((_, j) => (
              <GridCell
                key={`cell-${i}-${j}`}
                rowIndex={i}
                columnIndex={j}
                isActive={data[i][j]}
                isPlaying={j === currentStep}
                isBar={beatsPerBar ? j % beatsPerBar === 0 : false}
                onToggle={onCellToggle}
                onHover={onCellHover}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default memo(Grid);
