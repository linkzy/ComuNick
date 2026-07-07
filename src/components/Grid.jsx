import { useTranslation } from "react-i18next";
import { useBoardContext } from "../stores/BoardContext";
import { useGrid } from "../hooks/useGrid";
import Cell from "./Cell";
import "./Grid.css";

function Grid() {
  const { t } = useTranslation();
  const { currentBoard: board, loading } = useBoardContext();
  const gridStyle = useGrid(board?.rows, board?.cols);

  if (loading) {
    return <div className="grid-message">{t("app.loading")}</div>;
  }

  if (!board || board.rows === 0 || board.cols === 0) {
    return <div className="grid-message">{t("grid.empty")}</div>;
  }

  const totalCells = board.rows * board.cols;
  const cellCount = board.cellsOrder.length;

  if (cellCount === 0) {
    return <div className="grid-message">{t("grid.noCells")}</div>;
  }

  if (totalCells > 50) {
    return <div className="grid-message">{t("grid.tooLarge")}</div>;
  }

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${board.cols}, 1fr)`,
        gridTemplateRows: `repeat(${board.rows}, 1fr)`,
      }}
    >
      {board.cellsOrder.map((cellId) => (
        <Cell key={cellId} cell={board.cells[cellId]} />
      ))}
    </div>
  );
}

export default Grid;
