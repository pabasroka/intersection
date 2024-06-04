import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [segment1, setSegment1] = useState({ x1: "", y1: "", x2: "", y2: "" });
  const [segment2, setSegment2] = useState({ x1: "", y1: "", x2: "", y2: "" });
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
      setResult("Odcinki są równoległe lub zbieżne");
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

  const drawSegments = (intersectionX, intersectionY) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.moveTo(segment1.x1, segment1.y1);
    ctx.lineTo(segment1.x2, segment1.y2);
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(segment2.x1, segment2.y1);
    ctx.lineTo(segment2.x2, segment2.y2);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.stroke();

    if (intersectionX !== undefined && intersectionY !== undefined) {
      ctx.beginPath();
      ctx.arc(intersectionX, intersectionY, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "green";
      ctx.fill();
    }
  };

  useEffect(() => {
    drawSegments();
  }, [segment1, segment2]);

  return (
    <div className="App">
      <h1>Zbiór punktów przecięcia dwóch odcinków</h1>
      <div>
        <h2>Odcinek 1</h2>
        <input
          type="number"
          placeholder="x1"
          value={segment1.x1}
          onChange={(e) => handleInputChange(e, 1, "x1")}
        />
        <input
          type="number"
          placeholder="y1"
          value={segment1.y1}
          onChange={(e) => handleInputChange(e, 1, "y1")}
        />
        <input
          type="number"
          placeholder="x2"
          value={segment1.x2}
          onChange={(e) => handleInputChange(e, 1, "x2")}
        />
        <input
          type="number"
          placeholder="y2"
          value={segment1.y2}
          onChange={(e) => handleInputChange(e, 1, "y2")}
        />
      </div>
      <div>
        <h2>Odcinek 2</h2>
        <input
          type="number"
          placeholder="x1"
          value={segment2.x1}
          onChange={(e) => handleInputChange(e, 2, "x1")}
        />
        <input
          type="number"
          placeholder="y1"
          value={segment2.y1}
          onChange={(e) => handleInputChange(e, 2, "y1")}
        />
        <input
          type="number"
          placeholder="x2"
          value={segment2.x2}
          onChange={(e) => handleInputChange(e, 2, "x2")}
        />
        <input
          type="number"
          placeholder="y2"
          value={segment2.y2}
          onChange={(e) => handleInputChange(e, 2, "y2")}
        />
      </div>
      <button onClick={findIntersection}>Znajdź przecięcie</button>
      {result && <div>{result}</div>}
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="canvas"
      ></canvas>
    </div>
  );
}

export default App;
