import "./Grid.css";
import { Fragment, useCallback, useEffect, useState } from "react";
import { core } from "../../lib/webRenderer";

type GridProps = {
  data: boolean[][];
  handleChange: (args: boolean[][]) => void;
  renderHeader?: (rowIndex: number) => React.ReactNode;
  currentStep?: number;
  beatsPerBar?: number;
};

const useCurrentStep = (size: number) => {
  const [pos, setPos] = useState(-1);

  const handleSnapshot = useCallback(
    (e: { source?: string; data: number }) => {
      if (e?.source === "snapshot:patternpos") {
        setPos((prevPos) => (e.data === 0 ? 0 : prevPos + 1));
      }
    },
    [size]
  );

  useEffect(() => {
    core.on("snapshot", handleSnapshot);

    return () => {
      core.off("snapshot", handleSnapshot);
    };
  }, [handleSnapshot]);

  return pos;
};

const Grid: React.FC<GridProps> = ({
  data,
  handleChange,
  renderHeader,
  beatsPerBar,
}) => {
  const [currentAction, setCurrentAction] = useState<boolean>();

  const currentStep = useCurrentStep(data[0].length);

  const handleToggle = (
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
  };

  return (
    <div className="grid">
      {data.map((instrument, i) => (
        <div className="grid-row" key={`row-${i}`}>
          <div className="grid-row-header">
            {renderHeader ? renderHeader(i) : null}
          </div>
          <div className="grid-row-cells">
            {instrument.map((_, j) => (
              <div
                key={`cell-${i}-${j}`}
                onMouseDown={() => {
                  setCurrentAction(!data[i][j]);
                  handleToggle(i, j);
                }}
                onMouseEnter={(e) => {
                  if (e.buttons === 1) {
                    handleToggle(i, j, currentAction);
                  }
                }}
                className={`grid-cell ${
                  data[i][j] === true ? "grid-cell--active" : ""
                } ${j === currentStep ? "grid-cell--playing" : ""} ${
                  beatsPerBar && j % beatsPerBar === 0 ? "grid-cell--bar" : ""
                }`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Grid;
