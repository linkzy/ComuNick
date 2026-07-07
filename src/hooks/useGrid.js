import { useState, useEffect } from "react";

export function useGrid(rows, cols) {
  const [dimensions, setDimensions] = useState({ cellHeight: 100 });

  useEffect(() => {
    function calculate() {
      const cellHeight = Math.min(
        window.innerHeight / (rows || 1),
        window.innerWidth / (cols || 1)
      );
      setDimensions({ minHeight: Math.max(cellHeight, 60) });
    }

    calculate();
    window.addEventListener("resize", calculate);
    return () => window.removeEventListener("resize", calculate);
  }, [rows, cols]);

  return dimensions;
}
