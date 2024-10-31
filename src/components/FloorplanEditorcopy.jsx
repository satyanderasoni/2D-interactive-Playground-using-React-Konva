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

function FloorplanEditorCopy() {
  const stageRef = useRef(null);
  const [color, setColor] = useState("#2f2f2f");
  const [action, setAction] = useState(ACTIONS.SELECT);
  const [squares, setSquares] = useState([]);
  const [circles, setCircles] = useState([]);
  const [arrows, setArrows] = useState([]);
  const [textBoxes, setTextBoxes] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [selectedTextBox, setSelectedTextBox] = useState();

  const strokeColor = "#000";
  const isPainting = useRef();
  const currentShapeId = useRef();
  const transformerRef = useRef();

  const isDraggable = action === ACTIONS.SELECT;

  const handleColorChange = (e) => {
    setColor(e.target.value);
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
      case ACTIONS.TEXT:
        setSquares((text) =>
          text.map((text) => {
            if (text.id === currentShapeId.current) {
              return {
                ...text,
                width: x - text.x,
                height: y - text.y,
              };
            }
            return text;
          }),
        );
        break;
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
    const shape = stage.findOne((node) => node.id() === currentShapeId.current);

    if (shape) {
      transformerRef.current.nodes([shape]); // Select the shape
      stage.batchDraw(); // Redraw the stage
      setAction(ACTIONS.SELECT);
    }
    if (stage) {
      transformerRef.current.nodes([]); // Clear the selection
      stage.batchDraw(); // Redraw the stage
      console.log("No shape found, selection cleared");
    }
    if (!shape) {
      transformerRef.current.nodes([]); // Clear selection.
      console.log("No shape found, selection cleared");
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

  function onClick(e) {
    if (action !== ACTIONS.SELECT) return;
    const target = e.currentTarget;
    transformerRef.current.nodes([target]);
    console.log("shape selected");
  }

  // Update the text button click handler
  const onAddText = () => {
    const stage = stageRef.current;
    // eslint-disable-next-line no-unused-vars
    const { x, y } = stage.getPointerPosition();
    const id = uuidv4();

    setTextBoxes((prevText) => [
      ...prevText,
      { id, x: 20, y: 50, text: "Enter Text", fontSize: 24, fontFamily: "sans serif" },
    ]);
    console.log("text added");
    
  };

  const handleTextDragEnd = (e, id) => {
    const newText = textBoxes.map((textBox) => {
      if (textBox.id === id) {
        return { ...textBox, x: e.target.x(), y: e.target.y() };
      }
      return textBox;
    });
    setTextBoxes(newText);
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
                  <Button variant="outline" onClick={() => onAddText()}>
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
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
              >
                <Layer>
                  {textBoxes.map((textBox) => (
                    <Text
                      key={textBox.id}
                      x={textBox.x}
                      y={textBox.y}
                      fontSize={textBox.fontSize}
                      text={textBox.text}
                      fill={color}
                      draggable={isDraggable}
                      onClick={onClick}
                      onTap={() => setSelectedTextBox(textBox)}
                      onDblClick={(e) => handleTextDblClick(e, textBox.id)}
                      onDragEnd={(e) => handleTextDragEnd(e, textBox.id)}
                      keepRatio={true}
                    />
                  ))}

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

export default FloorplanEditorCopy;
