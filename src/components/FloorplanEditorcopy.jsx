import { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ACTIONS } from "./constants";
import { Stage, Layer, Rect, Circle, Transformer, Arrow,  } from "react-konva";
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

function FloorplanEditorCopy() {
  const stageRef = useRef(null);
  const [color, setColor] = useState("#2f2f2f");
  const [action, setAction] = useState(ACTIONS.SELECT);
  const [squares, setSquares] = useState([]);
  const [circles, setCircles] = useState([]);
  const [arrows, setArrows] = useState([]);
  

  const strokeColor = "#000";
  const isPainting = useRef();
  const currentShapeId = useRef();
  const transformerRef = useRef();


  const isDraggable = action === ACTIONS.SELECT;

  const handleColorChange = (event) => {
    setColor(event.target.value); // Update the state with the new color
  };

  function onPointerDown() {
    if (action === ACTIONS.SELECT) return;

    const stage = stageRef.current;
    const { x, y } = stage.getPointerPosition();
    const id = uuidv4();

    currentShapeId.current = id;
    isPainting.current = true;

    switch (action) {
      case ACTIONS.SQUARE:
        setSquares((squares) => [
          ...squares,
          {
            id,
            x,
            y,
            height: 20,
            width: 20,
            color,
          },
        ]);
        break;
      case ACTIONS.CIRCLE:
        setCircles((circles) => [
          ...circles,
          {
            id,
            x,
            y,
            radius: 20,
            color,
          },
        ]);
        break;

      case ACTIONS.ARROW:
        setArrows((arrows) => [
          ...arrows,
          {
            id,
            points: [x, y, x + 20, y + 20],
            color,
          },
        ]);
        break;
    }
  }

  function onPointerMove() {
    if (action === ACTIONS.SELECT || !isPainting.current) return;

    const stage = stageRef.current;
    const { x, y } = stage.getPointerPosition();

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
  }

  function onPointerUp() {
    isPainting.current = false;
    console.log("drawing");
  
    const stage = stageRef.current;
    const shape = stage.findOne(
      (node) => node.id() === currentShapeId.current
    );
  
    if (shape) {
      transformerRef.current.nodes([shape]); // Select the shape
      stage.batchDraw(); // Redraw the stage
      setAction(ACTIONS.SELECT);
    } if(stage) {
      // If no shape is found, deselect any selected shape
      transformerRef.current.nodes([]); // Clear the selection
      stage.batchDraw(); // Redraw the stage
      console.log("No shape found, selection cleared");
    }
  
    console.log("Shape drawn and selected");
  
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

  function onClick(e) {
    if (action !== ACTIONS.SELECT) return;
    const target = e.currentTarget;
    transformerRef.current.nodes([target]);
    console.log("shape selected");
    
  }

const handleTextInput = (shape, stageRef, inputRef) => {
  const stageBox = stageRef.current.container().getBoundingClientRect();

  // Get the shape's position on the canvas
  const { x, y } = shape.getAbsolutePosition();

  // Set input position based on shape's position and canvas offset
  inputRef.current.style.top = `${stageBox.top + y}px`;
  inputRef.current.style.left = `${stageBox.left + x}px`;
  inputRef.current.style.width = `${shape.width()}px`;
  inputRef.current.style.height = `${shape.height()}px`;
  inputRef.current.style.display = 'block';
  inputRef.current.value = shape.text() || '';
  inputRef.current.focus();

  // Handle Enter or Blur to save input
  const saveText = () => {
    shape.text(inputRef.current.value);
    inputRef.current.style.display = 'none';
  };

  inputRef.current.addEventListener('blur', saveText);
  inputRef.current.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveText();
  });
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
                    onClick={() => setAction(ACTIONS.SQUARE)}
                  >
                    <Icons.SquareIcon size={24} />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setAction(ACTIONS.CIRCLE)}
                  >
                    <Icons.Circle size={24} />
                  </Button>
                  <Button
                    variant="outline"
                    // onClick={() => handleAddShape("triangle")}
                  >
                    <Icons.Triangle size={24} />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setAction(ACTIONS.ARROW)}
                  >
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
                    // onClick={() => handleAddShape("text")}
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
        <Card className="w-620 h-877">
          <CardHeader>
            <h2 className="text-lg font-semibold text-center">
              Floorplan Canvas
            </h2>
          </CardHeader>
          <CardContent className="border-2 border-dashed border-gray-400">
            <Stage
              width={900}
              height={640}
              ref={stageRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            >
              <Layer>
                {/* <Rect
                  x={0}
                  y={0}
                  height={window.innerHeight}
                  width={window.innerWidth}
                  fill="#ffffff"
                  id="bg"
                  onClick={() => {
                    transformerRef.current.nodes([]);
                  }}
                /> */}

                {squares.map((square) => (
                  <Rect
                    key={square.id}
                    id={square.id}
                    x={square.x}
                    y={square.y}
                    stroke={strokeColor}
                    strokeWidth={2}
                    fill={square.color}
                    height={square.height}
                    width={square.width}
                    draggable={isDraggable}
                    onClick={onClick}
                    onDblClick={handleTextInput}
                  />
                ))}

                {circles.map((circle) => (
                  <Circle
                    key={circle.id}
                    id={circle.id}
                    radius={circle.radius}
                    x={circle.x}
                    y={circle.y}
                    stroke={strokeColor}
                    strokeWidth={2}
                    fill={circle.color}
                    draggable={isDraggable}
                    onClick={onClick}
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
                    onClick={onClick}
                  />
                ))}
                <Transformer ref={transformerRef} />
              </Layer>
            </Stage>
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

export default FloorplanEditorCopy;
