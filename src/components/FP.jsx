import { useRef, useState, useEffect } from "react";
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
import SingleStall from "@/assets/singleStall";
import Lstall from "@/assets/lstall";
import DoubleStall from "@/assets/doubleStall";
import VerticalDoubleStall from "@/assets/verticalDoubleStall";

function FP() {
  const stageRef = useRef(null);
  const [color, setColor] = useState("#2f2f2f");
  const [action, setAction] = useState(ACTIONS.SELECT);
  const [squares, setSquares] = useState([]);
  const [circles, setCircles] = useState([]);
  const [arrows, setArrows] = useState([]);
  const [textBoxes, setTextBoxes] = useState([]);
  const [selectedTextNode, setSelectedTextNode] = useState(null);
  const textEditingRef = useRef(null);
  const [editingText, setEditingText] = useState(false);
const textAreaRef = useRef(null);

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

  function isSketching(event) {
    isPainting.current = false;
    const stage = stageRef.current;
    const targetNode = event.target;

    if (targetNode === stage) {
      transformerRef.current.nodes([]);
      stage.batchDraw();
    } else {
      const shape = stage.findOne(
        (node) => node.id() === currentShapeId.current,
      );
      if (shape) {
        transformerRef.current.nodes([shape]);
        stage.batchDraw();
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
  }

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
          { id, x, y, text: "Double click to edit", fontSize: 24 },
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

// Add this new utility function
const getTextWidth = (text, fontSize = 24) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = `${fontSize}px Arial`;
  return context.measureText(text).width;
};

// Replace your handleTextEdit function with this improved version
const handleTextEdit = (textNode) => {
  setSelectedTextNode(textNode);
  setEditingText(true);
  
  const stage = stageRef.current;
  const stageBox = stage.container().getBoundingClientRect();
  const areaPosition = {
    x: stageBox.left + textNode.absolutePosition.x,
    y: stageBox.top + textNode.absolutePosition.y,
  };

  // Calculate text width and height
  const width = Math.max(100, getTextWidth(textNode.text, textNode.fontSize) + 20);
  const height = Math.max(textNode.fontSize + 10, (textNode.text.split('\n').length * textNode.fontSize) + 10);

  const textarea = document.createElement('textarea');
  document.body.appendChild(textarea);

  textarea.value = textNode.text;
  textarea.style.position = 'absolute';
  textarea.style.top = `${areaPosition.y}px`;
  textarea.style.left = `${areaPosition.x}px`;
  textarea.style.width = `${width}px`;
  textarea.style.height = `${height}px`;
  textarea.style.fontSize = `${textNode.fontSize}px`;
  textarea.style.padding = '5px';
  textarea.style.margin = '0px';
  textarea.style.overflow = 'hidden';
  textarea.style.background = 'none';
  textarea.style.outline = 'none';
  textarea.style.resize = 'none';
  textarea.style.lineHeight = textNode.fontSize + 'px';
  textarea.style.fontFamily = 'Arial';
  textarea.style.zIndex = '1000';
  textarea.style.minHeight = '50px';
  textarea.style.color = color;
  textarea.style.wordWrap = 'break-word';
  textarea.style.whiteSpace = 'pre-wrap';

  textAreaRef.current = textarea;
  textEditingRef.current = textarea;
  textarea.focus();

  function removeTextarea() {
    setEditingText(false);
    document.body.removeChild(textarea);
    window.removeEventListener('click', handleOutsideClick);
    textAreaRef.current = null;
    textEditingRef.current = null;
    setSelectedTextNode(null);
  }

  function handleOutsideClick(e) {
    if (e.target !== textarea) {
      updateText();
      removeTextarea();
    }
  }

  function updateText() {
    const newText = textarea.value;
    const newWidth = Math.max(100, getTextWidth(newText, textNode.fontSize) + 20);
    
    setTextBoxes((prevTextBoxes) =>
      prevTextBoxes.map((tb) =>
        tb.id === textNode.id 
          ? { 
              ...tb, 
              text: newText,
              width: newWidth,
            } 
          : tb
      )
    );
  }

  textarea.addEventListener('keydown', (e) => {
    // Handle Enter + shift for new lines
    if (e.key === 'Enter' && !e.shiftKey) {
      updateText();
      removeTextarea();
      e.preventDefault();
    }
    if (e.key === 'Escape') {
      removeTextarea();
    }
    
    // Automatically resize textarea
    const currentHeight = e.target.scrollHeight;
    if (currentHeight > parseInt(textarea.style.height)) {
      textarea.style.height = currentHeight + 'px';
    }
  });

  // Handle text changes
  textarea.addEventListener('input', () => {
    const newWidth = Math.max(100, getTextWidth(textarea.value, textNode.fontSize) + 20);
    textarea.style.width = `${newWidth}px`;
  });

  setTimeout(() => {
    window.addEventListener('click', handleOutsideClick);
  });
};



  useEffect(() => {
    return () => {
      if (textEditingRef.current) {
        document.body.removeChild(textEditingRef.current);
      }
    };
  }, []);

  return (
    <div className="flex h-screen p-4 gap-4">
      {/* Left Sidebar */}
      <div className="w-1/4">
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
            <Accordion type="single" collapsible>
              <AccordionItem value="basic-shapes">
                <AccordionTrigger>Stall Shapes</AccordionTrigger>
                <AccordionContent className="grid grid-cols-2 gap-2">
                  <Button
                    style={{ width: "100px", height: "100px" }}
                    variant="outline"
                  >
                    <SingleStall />
                  </Button>
                  <Button
                    style={{ width: "100px", height: "100px" }}
                    variant="outline"
                  >
                    <Lstall />
                  </Button>
                  <Button
                    style={{ width: "100px", height: "100px" }}
                    variant="outline"
                  >
                    <DoubleStall />
                  </Button>
                  <Button
                    style={{ width: "100px", height: "100px" }}
                    variant="outline"
                  >
                    <VerticalDoubleStall />
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
                      id={textBox.id}
                      x={textBox.x}
                      y={textBox.y}
                      text={textBox.text}
                      fontSize={textBox.fontSize}
                      fill={color}
                      draggable={isDraggable && !editingText}
                      visible={
                        !editingText || selectedTextNode?.id !== textBox.id
                      }
                      onClick={handleShapeSelection}
                      onDblClick={(e) => {
                        const textNode = e.target;
                        handleTextEdit({
                          id: textBox.id,
                          text: textBox.text,
                          width: textNode.width(),
                          height: textNode.height(),
                          fontSize: textBox.fontSize,
                          absolutePosition: textNode.absolutePosition(),
                        });
                      }}
                      onDragEnd={(e) => handleDragEnd(e, textBox.id, "textBox")}
                      width={getTextWidth(textBox.text, textBox.fontSize) + 20}
                      align="left"
                      padding={5}
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
                    }}
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
                <AccordionTrigger>Basic Properties</AccordionTrigger>
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
