import { useRef, useState } from "react";
import { Stage, Layer, Rect, Circle, Line, Text } from "react-konva";
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

function FloorplanEditor() {
  const [shapes, setShapes] = useState([]);
  const stageRef = useRef(null);
  const [color , setColor] = useState("#2f2f2f");

  const handleColorChange = (event) => {
    setColor(event.target.value); // Update the state with the new color
  };

  const handleAddShape = (shapeType) => {
    const newShape = {
      id: `${shapeType}-${Date.now()}`,
      type: shapeType,
      x: Math.random() * 50,
      y: Math.random() * 50,
    };
    setShapes((prevShapes) => [...prevShapes, newShape]);
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
                  <Button variant="outline" onClick={() => handleAddShape("square")}>
                    <Icons.SquareIcon size={24} />
                  </Button>
                  <Button variant="outline" onClick={() => handleAddShape("circle")}>
                    <Icons.Circle size={24} />
                  </Button>
                  <Button variant="outline" onClick={() => handleAddShape("triangle")}>
                    <Icons.Triangle size={24} />
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible>
                 <AccordionItem value="item-1">
                    <AccordionTrigger>Text</AccordionTrigger>
                    <AccordionContent className="grid grid-cols-3 gap-2">
                         <Button variant="outline"  onClick={() => handleAddShape("text")}>
                             <Icons.Type size={24} />
                         </Button>
                    </AccordionContent>
                 </AccordionItem>
             </Accordion>
            <Accordion type="single" collapsible>
              <AccordionItem value="navigation">
                <AccordionTrigger>Navigation</AccordionTrigger>
                <AccordionContent className="grid grid-cols-3 gap-2">
                  <Button variant="outline">
                    <Icons.ArrowUp size={24} />
                  </Button>
                  <Button variant="outline">
                    <Icons.ArrowDown size={24} />
                  </Button>
                  <Button variant="outline">
                    <Icons.ArrowLeft size={24} />
                  </Button>
                  <Button variant="outline">
                    <Icons.ArrowRight size={24} />
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
            <h2 className="text-lg font-semibold text-center">Floorplan Canvas</h2>
          </CardHeader>
          <CardContent className="border-2 border-dashed border-gray-400">
            <Stage width={900} height={640} ref={stageRef}>
              <Layer>
                {shapes.map((shape) => {
                  switch (shape.type) {
                    case "square":
                      return (
                        <Rect
                          key={shape.id}
                          x={shape.x}
                          y={shape.y}
                          width={100}
                          height={100}
                          stroke="black"
                          strokeWidth={2}
                          fill={color}
                          draggable
                        />
                      );
                    case "circle":
                      return (
                        <Circle
                          key={shape.id}
                          x={shape.x}
                          y={shape.y}
                          radius={50}
                          stroke="black"
                          strokeWidth={2}
                          draggable
                        />
                      );
                      case "text":
                        return (
                            <Text 
                            text="Some text on canvas" 
                            fontSize={15}
                            key={shape.id}
                            x={shape.x}
                            y={shape.y}
                            draggable
                            />
                        )
                    case "triangle":
                      return (
                        <Line
                          key={shape.id}
                          points={[50, 0, 100, 100, 0, 100]}
                          stroke="black"
                          strokeWidth={2}
                          draggable
                          closed
                          x={shape.x}
                          y={shape.y}
                        />
                      );
                    default:
                      return null;
                  }
                })}
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
                    <Input type="number" placeholder="Enter width" className="w-full" />
                  </div>
                  <div>
                    <Label className="block mb-1">Height</Label>
                    <Input type="number" placeholder="Enter height" className="w-full" />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Button className="items-baseline">Export</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default FloorplanEditor;
