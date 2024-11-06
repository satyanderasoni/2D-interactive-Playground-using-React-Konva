import { useRef, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Stage, Layer, Rect, Circle, Transformer, Arrow, Text } from "react-konva";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "./ui/input";
import { Label } from "@/components/ui/label";

function FP() {
  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const [shapes, setShapes] = useState([]); // Unified state for all shapes
  const [selectedShapeId, setSelectedShapeId] = useState(null);
  const [color, setColor] = useState("#2f2f2f");

  const handleColorChange = (e) => setColor(e.target.value);

  // 1. Unified function to add shapes
  const onAddShape = (shapeType) => {
    const { x, y } = stageRef.current.getPointerPosition();
    const newShape = {
      id: uuidv4(),
      x,
      y,
      shapeType,
      color,
      ...(shapeType === 'square' && { width: 80, height: 80, fill: color, stroke: "black", strokeWidth: 2 }),
      ...(shapeType === 'circle' && { radius: 50 , fill: color, stroke: "black", strokeWidth: 2  }),
      ...(shapeType === 'arrow' && { points: [x, y, x + 40, y + 40] , fill: color, stroke: "black", strokeWidth: 2 }),
      ...(shapeType === 'textBox' && { text: "Enter Text", fontSize: 24 })
    };
    setShapes([...shapes, newShape]);
  };

  // 2. Handle selection and update transformer
  const handleShapeSelection = (e) => {
    setSelectedShapeId(e.target.id());
  };

  // 3. Apply transformer on selection change
  useEffect(() => {
    const stage = stageRef.current;
    const transformer = transformerRef.current;

    const selectedNode = stage.findOne(`#${selectedShapeId}`);
    if (selectedNode) {
      transformer.nodes([selectedNode]);
    } else {
      transformer.nodes([]);
    }
    transformer.getLayer().batchDraw();
  }, [selectedShapeId]);

  // 4. Handle position updates and state changes on drag end
  const handleDragEnd = (e) => {
    const id = e.target.id();
    const { x, y } = e.target.position();
    
    setShapes((prevShapes) =>
      prevShapes.map((shape) =>
        shape.id === id ? { ...shape, x, y } : shape
      )
    );
    setSelectedShapeId(id); // Mark as selected
  };

  // 5. Handle double-click on text for editing
  const handleTextDblClick = (e, id) => {
    const shape = shapes.find((shape) => shape.id === id);
    if (shape && shape.shapeType === 'textBox') {
      const input = document.createElement("input");
      input.value = shape.text;
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
        setShapes((prevShapes) =>
          prevShapes.map((shape) =>
            shape.id === id ? { ...shape, text: input.value } : shape
          )
        );
        document.body.removeChild(input);
      };
      input.addEventListener("blur", handleInputBlur);
    }
  };

  // 6. Export function to save the canvas as an image
  const handleExport = () => {
    const uri = stageRef.current.toDataURL();
    const link = document.createElement("a");
    link.download = "Floorplan.png";
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                  <Button variant="outline" onClick={() => onAddShape("square")}>
                    <Icons.SquareIcon size={24} />
                  </Button>
                  <Button variant="outline" onClick={() => onAddShape("circle")}>
                    <Icons.Circle size={24} />
                  </Button>
                  <Button variant="outline" onClick={() => onAddShape("arrow")}>
                    <Icons.ArrowUp size={24} />
                  </Button>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-1">
                <AccordionTrigger>Text</AccordionTrigger>
                <AccordionContent className="grid grid-cols-3 gap-2">
                  <Button variant="outline" onClick={() => onAddShape("textBox")}>
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
            <h2 className="text-lg font-semibold text-center">Floorplan Canvas</h2>
          </CardHeader>
          <CardContent className="border-2 border-dashed border-gray-400">
            <div>
              <Stage
                width={950}
                height={630}
                ref={stageRef}
                onPointerUp={() => setSelectedShapeId(null)} // Deselect when clicking on empty space
              >
                <Layer>
                  {shapes.map((shape) => {
                    const commonProps = {
                      key: shape.id, // Added key prop
                      id: shape.id,
                      x: shape.x,
                      y: shape.y,
                      fill: shape.fill,
                      draggable: true,
                      onClick: handleShapeSelection,
                      onDragEnd: handleDragEnd

                    };

                    if (shape.shapeType === 'square') {
                      return <Rect key= {shape.id} id={shape.id} {...commonProps} width={shape.width} height={shape.height} fill={shape.color} stroke="#000" />;
                    }
                    if (shape.shapeType === 'circle') {
                      return <Circle key= {shape.id} id={shape.id} {...commonProps} radius={shape.radius} fill={shape.color} stroke="#000" />;
                    }
                    if (shape.shapeType === 'arrow') {
                      return <Arrow key= {shape.id} id={shape.id} {...commonProps} points={shape.points} fill={shape.color} stroke="#000" />;
                    }
                    if (shape.shapeType === 'textBox') {
                      return (
                        <Text
                        key= {shape.id} 
                        id={shape.id}
                          {...commonProps}
                          text={shape.text}
                          fontSize={shape.fontSize}
                          fill={shape.color}
                          onDblClick={(e) => handleTextDblClick(e, shape.id)}
                        />
                      );
                    }
                    return null;
                  })}
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
                    <Input type="color" value={color} onChange={handleColorChange} />
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
