import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [segment1, setSegment1] = useState({ x1: "", y1: "", x2: "", y2: "" });
  const [segment2, setSegment2] = useState({ x1: "", y1: "", x2: "", y2: "" });
  const [warning, setWarning] = useState(false);
  const [result, setResult] = useState(null);
  const canvasRef = useRef(null);

  const handleInputChange = (event, segment, key) => {
    const value = event.target.value;
    if (segment === 1) {
      setSegment1({ ...segment1, [key]: value });
    } else {
      setSegment2({ ...segment2, [key]: value });
    }
  };

  const findIntersection = () => {
    if (
      Object.values(segment1).some((value) => value === "") ||
      Object.values(segment2).some((value) => value === "")
    ) {
      setWarning(true);
      return;
    }
    setWarning(false);
    const x1 = parseFloat(segment1.x1);
    const y1 = parseFloat(segment1.y1);
    const x2 = parseFloat(segment1.x2);
    const y2 = parseFloat(segment1.y2);
    const x3 = parseFloat(segment2.x1);
    const y3 = parseFloat(segment2.y1);
    const x4 = parseFloat(segment2.x2);
    const y4 = parseFloat(segment2.y2);

    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    if (denominator === 0) {
      if (
        (x3 - x1) * (y2 - y1) === (y3 - y1) * (x2 - x1) &&
        (x4 - x1) * (y2 - y1) === (y4 - y1) * (x2 - x1)
      ) {
        const overlapStartX = Math.max(Math.min(x1, x2), Math.min(x3, x4));
        const overlapEndX = Math.min(Math.max(x1, x2), Math.max(x3, x4));
        const overlapStartY = Math.max(Math.min(y1, y2), Math.min(y3, y4));
        const overlapEndY = Math.min(Math.max(y1, y2), Math.max(y3, y4));

        const overlapCoords = {
          startX: overlapStartX.toFixed(2),
          startY: overlapStartY.toFixed(2),
          endX: overlapEndX.toFixed(2),
          endY: overlapEndY.toFixed(2),
        };

        if (overlapStartX < overlapEndX || overlapStartY < overlapEndY) {
          setResult(
            `Odcinki nakładają się od punktu (${overlapCoords.startX}, ${overlapCoords.startY}) do punktu (${overlapCoords.endX}, ${overlapCoords.endY})`
          );
          drawSegments(undefined, undefined, overlapCoords);
          return;
        } else {
          setResult("Odcinki są równoległe, ale się nie nakładają");
        }
      } else {
        setResult("Odcinki są równoległe, ale się nie nakładają");
      }
      drawSegments();
      return;
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      const intersectionX = x1 + t * (x2 - x1);
      const intersectionY = y1 + t * (y2 - y1);
      setResult(
        `Odcinki przecinają się w punkcie (${intersectionX.toFixed(
          2
        )}, ${intersectionY.toFixed(2)})`
      );
      drawSegments(intersectionX, intersectionY);
    } else {
      setResult("Odcinki nie przecinają się");
      drawSegments();
    }
  };

  const drawGridLines = (
    startHorizontal,
    endHorizontal,
    startVertical,
    endVertical
  ) => {
    const getManipulator = (start, end) => {
      const range = Math.round(Math.abs(start - end + 1));
      const count = range.toString().length;
      return Math.pow(10, count - 1);
    };

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const lineColor = "lightgray";
    const lineWidth = 1;
    const padding = 15;
    const manipulatorX = getManipulator(startHorizontal, endHorizontal);
    const manipulatorY = getManipulator(startVertical, endVertical);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const numHorizontalLines =
      (endHorizontal - startHorizontal + 1) / manipulatorX;
    const numVerticalLines = (endVertical - startVertical + 1) / manipulatorY;
    const horizontalSpacing =
      (canvasHeight - 2 * padding) / (numHorizontalLines * manipulatorX - 1);
    const verticalSpacing =
      (canvasWidth - 2 * padding) / (numVerticalLines * manipulatorY - 1);

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    for (let i = endHorizontal; i >= startHorizontal; i -= manipulatorX) {
      const y = padding + (endHorizontal - i) * horizontalSpacing;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvasWidth - padding, y);
      ctx.stroke();
      ctx.fillStyle = "black";
      ctx.textAlign = "right";
      ctx.fillText(i, padding + manipulatorX / 10, y + 5);
    }

    for (let i = startVertical; i <= endVertical; i += manipulatorY) {
      const x = padding + (i - startVertical) * verticalSpacing;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, canvasHeight - padding);
      ctx.stroke();
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.fillText(i, x, padding - 5);
    }
  };

  const drawSegments = (intersectionX, intersectionY, overlapCoords) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const centerMargin = Number(canvas.width) / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const points = [
      { x: Number(segment1.x1), y: Number(segment1.y1) },
      { x: Number(segment1.x2), y: Number(segment1.y2) },
      { x: Number(segment2.x1), y: Number(segment2.y1) },
      { x: Number(segment2.x2), y: Number(segment2.y2) },
    ];

    if (intersectionX !== undefined && intersectionY !== undefined) {
      points.push({ x: Number(intersectionX), y: Number(intersectionY) });
    }

    const minX = Math.min(...points.map((p) => p.x));
    const maxX = Math.max(...points.map((p) => p.x));
    const minY = Math.min(...points.map((p) => p.y));
    const maxY = Math.max(...points.map((p) => p.y));

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const padding = 30;
    const scaleX = (canvasWidth - padding) / (maxX - minX);
    const scaleY = (canvasHeight - padding) / (maxY - minY);

    const transform = (x, y) => {
      let newX, newY;
      if (minX === maxX) {
        newX = centerMargin;
      } else {
        newX = (x - minX) * scaleX + padding / 2;
      }
      if (minY === maxY) {
        newY = canvasHeight / 2;
      } else {
        newY = canvasHeight - ((y - minY) * scaleY + padding / 2);
      }
      return { x: newX, y: newY };
    };

    drawGridLines(minY, maxY, minX, maxX);

    ctx.beginPath();
    let start = transform(Number(segment1.x1), Number(segment1.y1));
    let end = transform(Number(segment1.x2), Number(segment1.y2));
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    start = transform(Number(segment2.x1), Number(segment2.y1));
    end = transform(Number(segment2.x2), Number(segment2.y2));
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.stroke();

    if (intersectionX !== undefined && intersectionY !== undefined) {
      const intersection = transform(
        Number(intersectionX),
        Number(intersectionY)
      );
      ctx.beginPath();
      ctx.arc(intersection.x, intersection.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "green";
      ctx.fill();
    }

    if (overlapCoords !== undefined) {
      ctx.beginPath();
      start = transform(
        Number(overlapCoords.startX),
        Number(overlapCoords.startY)
      );
      end = transform(Number(overlapCoords.endX), Number(overlapCoords.endY));
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.strokeStyle = "green";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  const generateCrossingPoints = () => {
    const seg1 = {
      x1: Math.floor(Math.random() * 100),
      y1: Math.floor(Math.random() * 100),
      x2: Math.floor(Math.random() * 100),
      y2: Math.floor(Math.random() * 100),
    };
    const seg2 = {
      x1: Math.floor(Math.random() * 100),
      y1: Math.floor(Math.random() * 100),
      x2: Math.floor(Math.random() * 100),
      y2: Math.floor(Math.random() * 100),
    };

    setSegment1(seg1);
    setSegment2(seg2);
  };

  useEffect(() => {
    drawSegments();
  }, [segment1, segment2]);

  return (
    <div className="App">
      <h1>Przecięcie dwóch odcinków</h1>
      <div className="Wrapper">
        <div>
          <h2>Odcinek 1</h2>
          <div className="PointsGroup">
            <div className="InputGroup">
              <label>
                x1:
                <input
                  className="InputBlue"
                  type="number"
                  placeholder="x1"
                  value={segment1.x1}
                  onChange={(e) => handleInputChange(e, 1, "x1")}
                />
              </label>
              <label>
                y1:
                <input
                  className="InputBlue"
                  type="number"
                  placeholder="y1"
                  value={segment1.y1}
                  onChange={(e) => handleInputChange(e, 1, "y1")}
                />
              </label>
            </div>
            <div className="InputGroup">
              <label>
                x2:
                <input
                  className="InputBlue"
                  type="number"
                  placeholder="x2"
                  value={segment1.x2}
                  onChange={(e) => handleInputChange(e, 1, "x2")}
                />
              </label>
              <label>
                y2:
                <input
                  className="InputBlue"
                  type="number"
                  placeholder="y2"
                  value={segment1.y2}
                  onChange={(e) => handleInputChange(e, 1, "y2")}
                />
              </label>
            </div>
          </div>
          <div>
            <h2>Odcinek 2</h2>
            <div className="PointsGroup">
              <div className="InputGroup">
                <label>
                  x1:
                  <input
                    className="InputRed"
                    type="number"
                    placeholder="x1"
                    value={segment2.x1}
                    onChange={(e) => handleInputChange(e, 2, "x1")}
                  />
                </label>
                <label>
                  y1:
                  <input
                    className="InputRed"
                    type="number"
                    placeholder="y1"
                    value={segment2.y1}
                    onChange={(e) => handleInputChange(e, 2, "y1")}
                  />
                </label>
              </div>
              <div className="InputGroup">
                <label>
                  x2:
                  <input
                    className="InputRed"
                    type="number"
                    placeholder="x2"
                    value={segment2.x2}
                    onChange={(e) => handleInputChange(e, 2, "x2")}
                  />
                </label>
                <label>
                  y2
                  <input
                    className="InputRed"
                    type="number"
                    placeholder="y2"
                    value={segment2.y2}
                    onChange={(e) => handleInputChange(e, 2, "y2")}
                  />
                </label>
              </div>
            </div>
          </div>
          <div className="ButtonSection">
            <button onClick={findIntersection}>Znajdź przecięcie</button>
            <button onClick={generateCrossingPoints}>Generuj losowo</button>
            {warning && <p>Uzupełnij wszystkie wartości!</p>}
          </div>
        </div>
        <div className="CanvasSection">
          <canvas
            ref={canvasRef}
            width={500}
            height={500}
            className="canvas"
          ></canvas>
          {result && <div>{result}</div>}
        </div>
      </div>
    </div>
  );
}

export default App;
