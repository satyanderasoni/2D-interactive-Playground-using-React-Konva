import { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ACTIONS } from "./constants";
import {
  Stage,
  Layer,
  Rect,
  Circle,
  Transformer,
  Arrow,
  Text,
} from "react-konva";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "./ui/input";
import { Label } from "@/components/ui/label";


function FP() {
  const stageRef = useRef(null);
  const [color, setColor] = useState("#2f2f2f");
  const [action, setAction] = useState(ACTIONS.SELECT);
  const [squares, setSquares] = useState([]);
  const [circles, setCircles] = useState([]);
  const [arrows, setArrows] = useState([]);
  const [textBoxes, setTextBoxes] = useState([]);
  //   const [selectedTextBox, setSelectedTextBox] = useState();

  const strokeColor = "#000";
  const isPainting = useRef();
  const currentShapeId = useRef();
  const transformerRef = useRef();

  const isDraggable = action === ACTIONS.SELECT;

  const handleColorChange = (e) => {
    setColor(e.target.value);
  };

  function handleShapeUpdate() {
    if (action === ACTIONS.SELECT || !isPainting.current) return;

    const stage = stageRef.current;
    const { x, y } = stage.getPointerPosition();
    console.log("handleShapeUpdate");
    switch (action) {
      case ACTIONS.SQUARE:
        setSquares((squares) =>
          squares.map((square) => {
            if (square.id === currentShapeId.current) {
              return {
                ...square,
                width: x - square.x,
                height: y - square.y,
              };
            }
            return square;
          }),
        );
        break;
      case ACTIONS.CIRCLE:
        setCircles((circles) =>
          circles.map((circle) => {
            if (circle.id === currentShapeId.current) {
              return {
                ...circle,
                radius: ((y - circle.y) ** 2 + (x - circle.x) ** 2) ** 0.5,
              };
            }
            return circle;
          }),
        );
        break;
      case ACTIONS.ARROW:
        setArrows((arrows) =>
          arrows.map((arrow) => {
            if (arrow.id === currentShapeId.current) {
              return {
                ...arrow,
                points: [arrow.points[0], arrow.points[1], x, y],
              };
            }
            return arrow;
          }),
        );
        break;
    }
    console.log("handleShapeUpdate");
  }

  function isSketching(event) {
    isPainting.current = false;
    console.log("not drawing");

    const stage = stageRef.current;
    const targetNode = event.target;

    if (targetNode === stage) {
      // If the click event is targeting the stage (i.e., empty space), clear the selection
      transformerRef.current.nodes([]); // Clear selection
      stage.batchDraw(); // Redraw the stage
      console.log("Selection cleared");
    } else {
      const shape = stage.findOne(
        (node) => node.id() === currentShapeId.current,
      );
      if (shape) {
        transformerRef.current.nodes([shape]); // Select the shape
        stage.batchDraw(); // Redraw the stage
        setAction(ACTIONS.SELECT);
      }
    }
  }

  function handleExport() {
    const uri = stageRef.current.toDataURL();
    var link = document.createElement("a");
    link.download = "Floorplan.png";
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleShapeSelection(event) {
    if (action !== ACTIONS.SELECT) return;
    const selectedNode = event.currentTarget;
    transformerRef.current.nodes([selectedNode]);
    console.log("handleShapeSelection");
  }

  // Update the text button click handler
  //   const onAddText = () => {
  //     const stage = stageRef.current;
  //     const { x, y } = stage.getPointerPosition();
  //     const id = uuidv4();

  //     setTextBoxes((prevText) => [
  //       ...prevText,
  //       { id, x, y, text: "Enter Text", fontSize:24 },
  //     ]);
  //   };

  function onAddShape(shapeType) {
    const stage = stageRef.current;
    const { x, y } = stage.getPointerPosition() || { x: 50, y: 20 };
    const id = uuidv4();

    switch (shapeType) {
      case "square":
        setSquares((prevSquares) => [
          ...prevSquares,
          { id, x, y, height: 80, width: 80, color: color },
        ]);
        break;
      case "circle":
        setCircles((prevCircles) => [
          ...prevCircles,
          { id, x, y, radius: 50, color: color },
        ]);
        break;
      case "arrow":
        setArrows((prevArrows) => [
          ...prevArrows,
          { id, points: [x, y, x + 40, y + 80], color: color },
        ]);
        break;
      case "textBox":
        setTextBoxes((prevText) => [
          ...prevText,
          { id, x, y, text: "Enter Text", fontSize: 24 },
        ]);
        break;
      default:
        console.warn(`Unknown shape type: ${shapeType}`);
        break;
    }
  }

  const handleDragEnd = (e, id, shapeType) => {
    switch (shapeType) {
      case "textBox": {
        const newText = textBoxes.map((textBox) => {
          if (textBox.id === id) {
            return { ...textBox, x: e.target.x(), y: e.target.y() };
          }
          return textBox;
        });
        setTextBoxes(newText);
        break;
      }
      case "square": {
        const newSquares = squares.map((square) => {
          if (square.id === id) {
            return { ...square, x: e.target.x(), y: e.target.y() };
          }
          return square;
        });
        setSquares(newSquares);
        break;
      }
      case "circle": {
        const newCircles = circles.map((circle) => {
          if (circle.id === id) {
            return { ...circle, x: e.target.x(), y: e.target.y() };
          }
          return circle;
        });
        setCircles(newCircles);
        break;
      }
      case "arrow": {
        const newArrows = arrows.map((arrow) => {
          if (arrow.id === id) {
            return { ...arrow, x: e.target.x(), y: e.target.y() };
          }
          return arrow;
        });
        setArrows(newArrows);
        break;
      }
      default:
        break;
    }
  };

  const handleTextDblClick = (e, id) => {
    const textBox = textBoxes.find((textBox) => textBox.id === id);
    if (textBox) {
      const input = document.createElement("input");
      input.value = textBox.text;
      input.style.position = "absolute";
      input.style.top = e.target.getAbsolutePosition().y + "px";
      input.style.left = e.target.getAbsolutePosition().x + "px";
      input.style.width = "200px";
      input.style.height = "30px";
      input.style.fontSize = "18px";
      input.style.padding = "10px";
      input.style.border = "1px solid #ccc";
      input.style.borderRadius = "5px";
      input.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.2)";
      document.body.appendChild(input);
      input.focus();
      input.select();

      const handleInputBlur = () => {
        const newText = textBoxes.map((textBox) => {
          if (textBox.id === id) {
            return { ...textBox, text: input.value };
          }
          return textBox;
        });
        setTextBoxes(newText);
        document.body.removeChild(input);
      };
      input.addEventListener("blur", handleInputBlur);
    }
  };

  return (
    <div className="flex h-screen p-4 gap-4">
      {/* Left Sidebar */}
      <div className="w-1/6">
        <Card className="h-full">
          <CardHeader>
            <h2 className="text-lg font-semibold">Tools</h2>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="basic-shapes">
                <AccordionTrigger>Basic Shapes</AccordionTrigger>
                <AccordionContent className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => onAddShape("square")}
                  >
                    <Icons.SquareIcon size={24} />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onAddShape("circle")}
                  >
                    <Icons.Circle size={24} />
                  </Button>
                  <Button variant="outline" onClick={() => onAddShape("arrow")}>
                    <Icons.ArrowUp size={24} />
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Text</AccordionTrigger>
                <AccordionContent className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => onAddShape("textBox")}
                  >
                    <Icons.Type size={24} />
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>

      {/* Canvas/Stage */}
      <div className="flex-grow">
        <Card className="w-full">
          <CardHeader>
            <h2 className="text-lg font-semibold text-center">
              Floorplan Canvas
            </h2>
          </CardHeader>
          <CardContent className="border-2 border-dashed border-gray-400">
            <div>
              <Stage
                width={950}
                height={630}
                ref={stageRef}
                // onPointerDown={onPointerDown}
                onDragMove={handleShapeUpdate}
                onPointerUp={isSketching}
              >
                <Layer>
                  {textBoxes.map((textBox) => (
                    <Text
                      key={textBox.id}
                      x={textBox.x}
                      y={textBox.y}
                      text={textBox.text}
                      fontSize={textBox.fontSize}
                      fill={color}
                      draggable={isDraggable}
                      onClick={handleShapeSelection}
                      onDblClick={(e) => handleTextDblClick(e, textBox.id)}
                      onDragEnd={(e) => handleDragEnd(e, textBox.id, "textBox")}
                      keepRatio={true}
                      centeredScaling={true}
                    />
                  ))}

                  {squares.map((square) => (
                    <Rect
                      key={square.id}
                      id={square.id}
                      x={square.x}
                      y={square.y}
                      fill={square.color}
                      height={square.height}
                      width={square.width}
                      draggable={isDraggable}
                      onClick={handleShapeSelection}
                      onDragEnd={(e) => handleDragEnd(e, square.id, "square")}
                    />
                  ))}

                  {circles.map((circle) => (
                    <Circle
                      key={circle.id}
                      id={circle.id}
                      radius={circle.radius}
                      x={circle.x}
                      y={circle.y}
                      fill={circle.color}
                      draggable={isDraggable}
                      onClick={handleShapeSelection}
                      onDragEnd={(e) => handleDragEnd(e, circle.id, "circle")}
                    />
                  ))}
                  {arrows.map((arrow) => (
                    <Arrow
                      key={arrow.id}
                      id={arrow.id}
                      points={arrow.points}
                      stroke={strokeColor}
                      strokeWidth={2}
                      fill={arrow.color}
                      draggable={isDraggable}
                      onClick={handleShapeSelection}
                      onDragEnd={(e) => handleDragEnd(e, arrow.id, "arrow")}
                    />
                  ))}
                  <Transformer
                    ref={transformerRef}
                    anchorCornerRadius={5}
                    anchorStroke="black"
                    borderStroke="black"
                    anchorStyleFunc={(anchor) => {
                      if (
                        anchor.hasName("top-center") ||
                        anchor.hasName("bottom-center") 
                      ) {
                        anchor.height(6);
                        anchor.offsetY(3);
                        anchor.width(30);
                        anchor.offsetX(15);
                      }
                      if (
                        anchor.hasName("middle-left") ||
                        anchor.hasName("middle-right")
                      ) {
                        anchor.height(30);
                        anchor.offsetY(15);
                        anchor.width(6);
                        anchor.offsetX(3);
                      }
                    }
                  }
                  />
                </Layer>
              </Stage>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Sidebar */}
      <div className="w-1/6">
        <Card className="h-full">
          <CardHeader>
            <h2 className="text-lg font-semibold">Properties</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Accordion type="single" collapsible>
              <AccordionItem value="text-properties">
                <AccordionTrigger>Text Properties</AccordionTrigger>
                <AccordionContent className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="block mb-1">Color</Label>
                    <Input
                      type="color"
                      value={color}
                      onChange={handleColorChange}
                    />
                  </div>
                  <div>
                    <Label className="block mb-1">Width</Label>
                    <Input
                      type="number"
                      placeholder="Enter width"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label className="block mb-1">Height</Label>
                    <Input
                      type="number"
                      placeholder="Enter height"
                      className="w-full"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Button className="items-baseline" onClick={handleExport}>
              Export
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export default FP;
