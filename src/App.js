import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  // State to manage the coordinates of the first and second segments
  const [segment1, setSegment1] = useState({ x1: "", y1: "", x2: "", y2: "" });
  const [segment2, setSegment2] = useState({ x1: "", y1: "", x2: "", y2: "" });
  // State to show a warning if inputs are invalid
  const [warning, setWarning] = useState(false);
  // State to store the result of the intersection calculation
  const [result, setResult] = useState(null);
  // Reference to the canvas element
  const canvasRef = useRef(null);
  // Ref for file input element
  const fileInputRef = useRef(null);

  // Handles the change in input fields for segment coordinates
  const handleInputChange = (event, segment, key) => {
    const value = event.target.value;
    if (segment === 1) {
      setSegment1({ ...segment1, [key]: value });
    } else {
      setSegment2({ ...segment2, [key]: value });
    }
  };

  // Function to find the intersection between two segments
  const findIntersection = () => {
    // Check if any input value is missing
    if (
      Object.values(segment1).some((value) => value === "") ||
      Object.values(segment2).some((value) => value === "")
    ) {
      setWarning(true);
      return;
    }
    setWarning(false);
    // Parse the input values to float
    const x1 = parseFloat(segment1.x1);
    const y1 = parseFloat(segment1.y1);
    const x2 = parseFloat(segment1.x2);
    const y2 = parseFloat(segment1.y2);
    const x3 = parseFloat(segment2.x1);
    const y3 = parseFloat(segment2.y1);
    const x4 = parseFloat(segment2.x2);
    const y4 = parseFloat(segment2.y2);

    // Calculate the denominator of the intersection formula
    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    // Check if segments are parallel
    if (denominator === 0) {
      if (
        (x3 - x1) * (y2 - y1) === (y3 - y1) * (x2 - x1) &&
        (x4 - x1) * (y2 - y1) === (y4 - y1) * (x2 - x1)
      ) {
        // Calculate the overlapping segment if they are collinear
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
        // Check if the segments overlap at a single point or along a segment
        if (overlapStartX === overlapEndX && overlapStartY === overlapEndY) {
          setResult(
            `Odcinki przecinają się w punkcie (${overlapCoords.startX}, ${overlapCoords.startY})`
          );
          drawSegments(undefined, undefined, overlapCoords);
          return;
        } else if (overlapStartX < overlapEndX || overlapStartY < overlapEndY) {
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

    // Calculate the intersection point using the parametric form of the line equations
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;

    // Check if the intersection point lies within both segments
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

  // Function to draw grid lines on the canvas
  const drawGridLines = (
    startHorizontal,
    endHorizontal,
    startVertical,
    endVertical
  ) => {
    // Helper function to get the scaling factor for grid lines
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
    // Draw horizontal grid lines
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

    // Draw vertical grid lines
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

  // Draws segments (lines) on the canvas for both segment1 and segment2,
  // along with optional visual elements like intersection points or overlapping segments.
  const drawSegments = (intersectionX, intersectionY, overlapCoords) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const centerMargin = Number(canvas.width) / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Array to store all points for scaling calculations
    const points = [
      { x: Number(segment1.x1), y: Number(segment1.y1) },
      { x: Number(segment1.x2), y: Number(segment1.y2) },
      { x: Number(segment2.x1), y: Number(segment2.y1) },
      { x: Number(segment2.x2), y: Number(segment2.y2) },
    ];

    if (intersectionX !== undefined && intersectionY !== undefined) {
      points.push({ x: Number(intersectionX), y: Number(intersectionY) });
    }

    // Find the minimum and maximum coordinates for scaling
    const minX = Math.min(...points.map((p) => p.x));
    const maxX = Math.max(...points.map((p) => p.x));
    const minY = Math.min(...points.map((p) => p.y));
    const maxY = Math.max(...points.map((p) => p.y));

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const padding = 30;
    const scaleX = (canvasWidth - padding) / (maxX - minX);
    const scaleY = (canvasHeight - padding) / (maxY - minY);

    // Transforms the original x and y coordinates to the canvas coordinates
    // considering scaling and padding. If all x or y values are the same,
    // centers the coordinates on the canvas.
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

    // Draw grid lines before drawing segments
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

    // Draw intersection point if defined
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

    // Draw overlapping segment if overlapCoords are defined
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

  // Generates random coordinates for segment1 and segment2
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

    setWarning(false);

    // Update segment1 and segment2 with new random values
    setSegment1(seg1);
    setSegment2(seg2);
  };

  // Handles file upload: validates content and parse into segments
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const contents = e.target.result;

        if (!isValidFileContents(contents)) {
          setWarning(true);
          setSegment1({ x1: "", y1: "", x2: "", y2: "" });
          setSegment2({ x1: "", y1: "", x2: "", y2: "" });
          return;
        }

        const lines = contents.split("\n");
        if (lines.length >= 2) {
          const seg1Values = lines[0].split(",").map((val) => val.trim());
          const seg2Values = lines[1].split(",").map((val) => val.trim());
          if (seg1Values.length === 4 && seg2Values.length === 4) {
            const seg1 = {
              x1: seg1Values[0],
              y1: seg1Values[1],
              x2: seg1Values[2],
              y2: seg1Values[3],
            };
            const seg2 = {
              x1: seg2Values[0],
              y1: seg2Values[1],
              x2: seg2Values[2],
              y2: seg2Values[3],
            };
            setSegment1(seg1);
            setSegment2(seg2);
            setWarning(false);
          } else {
            setWarning(true);
          }
        } else {
          setWarning(true);
        }
      };
      reader.readAsText(file);
    }
  };

  // Function to handle click on upload button
  const handleUploadButtonClick = () => {
    document.getElementById("fileInput").click(); // Trigger file input click
  };

  // Function to handle click on "Reset" button
  const handleFileClear = () => {
    setSegment1({ x1: "", y1: "", x2: "", y2: "" }); // Clear segments
    setSegment2({ x1: "", y1: "", x2: "", y2: "" });
    setWarning(false); // Clear warning

    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  // Validate for valid characters: numbers, floats, dots, commas, and minuses
  const isValidFileContents = (contents) => {
    const regex =
      /^-?\d+(\.\d+)?(\s*,\s*-?\d+(\.\d+)?){3}(\s*\r?\n\s*-?\d+(\.\d+)?(\s*,\s*-?\d+(\.\d+)?){3})*$/;
    return regex.test(contents.trim());
  };

  // Redraws the segments and grid lines whenever input values change
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
              <div className="Brackets">{"{ "} </div>
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
              <div className="Brackets">, </div>
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
              <div className="Brackets">{"}"} </div>
            </div>
            <div className="InputGroup">
              <div className="Brackets">{"{ "} </div>
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
              <div className="Brackets">, </div>
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
              <div className="Brackets">{"}"} </div>
            </div>
          </div>
          <div>
            <h2>Odcinek 2</h2>
            <div className="PointsGroup">
              <div className="InputGroup">
                <div className="Brackets">{"{ "} </div>
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
                <div className="Brackets">, </div>
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
                <div className="Brackets">{"}"} </div>
              </div>
              <div className="InputGroup">
                <div className="Brackets">{"{ "} </div>
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
                <div className="Brackets">, </div>
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
                <div className="Brackets">{"}"} </div>
              </div>
            </div>
          </div>
          <div className="ButtonSection">
            <button onClick={findIntersection}>Znajdź przecięcie</button>
            <button onClick={generateCrossingPoints}>Generuj losowo</button>
            <button className="UploadButton" onClick={handleUploadButtonClick}>
              Załaduj plik
            </button>
            <button onClick={handleFileClear}>Reset</button>
            <input
              type="file"
              id="fileInput"
              ref={fileInputRef}
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
            {warning && (
              <p>Wprowadzono nieprawidłowe lub niepełne dane lub plik.</p>
            )}
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
