import "./Grid.css";
import {
  CSSProperties,
  Fragment,
  useCallback,
  useEffect,
  useState,
} from "react";
import { core } from "../../lib/webRenderer";

type GridProps = {
  data: boolean[][];
  handleChange: (args: boolean[][]) => void;
  headers: React.ReactNode[];
  currentStep?: number;
};

const useCurrentStep = (size: number) => {
  const [pos, setPos] = useState(-1);

  const handleSnapshot = useCallback((e: { source?: string; data: number }) => {
    if (e?.source === "snapshot:patternpos") {
      setPos(prevPos => e.data === 0 ? 0 : prevPos + 1 );
    }
  }, [size]);

  useEffect(() => {
    core.on("snapshot", handleSnapshot);

    return () => {
      core.off("snapshot", handleSnapshot);
    };
  }, [handleSnapshot]);

  return pos;
};

const Grid: React.FC<GridProps> = ({ data, handleChange, headers }) => {
  const style = { "--cols": data[0].length } as CSSProperties;
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
    <div className="grid" style={style}>
      {data.map((instrument, i) => (
        <Fragment key={`row-${i}`}>
          <div key={`header-${i}`}>
            {headers[i]}
          </div>
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
              } ${j === currentStep ? "grid-cell--playing" : ""}`}
            />
          ))}
        </Fragment>
      ))}
    </div>
  );
};

export default Grid;
