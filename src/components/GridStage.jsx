import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Stage, Layer, Rect, Circle, Line } from "react-konva";
import {  PropTypes } from 'prop-types';
import { useRef } from "react";



function GridStage({ shapes }) {
  const stageRef = useRef(null)
  

  // const [action , setAction] = useState();

  // function onPointerMove() {

  // }

  // function onPointerDown() {
    
  // }

  // function onPointerUp() {
    
  // }


  return (
    <Card className="w-620 h-877">
      <CardHeader>
        <h2 className="text-lg font-semibold text-center">Floorplan Canvas</h2>
      </CardHeader>
      <CardContent className=" border-2 border-dashed border-gray-400 ">
        <Stage 
        width={620} 
        height={640}
        // onPointerDown={onPointerDown}
        // onPointerMove={onPointerMove}
        // onPointerUp={onPointerUp}
        ref={stageRef}
        >
          <Layer>
            {shapes.map((shape) => {
              switch (shape.type) {
                case "square":
                  return (
                    <Rect
                      key={shape.id}
                      x={Math.random() * 50} // Random positioning for demo
                      y={Math.random() * 50}
                      width={100}
                      height={100}
                      stroke={2}
                      draggable="true"
                    />
                  );
                case "circle":
                  return (
                    <Circle
                      key={shape.id}
                      x={Math.random() * 50}
                      y={Math.random() * 50}
                      radius={25}
                      stroke={2}
                      draggable="true"
                    />
                  );
                case "triangle":
                  return (
                    <Line
                      key={shape.id}
                      points={[50, 0, 100, 100, 0, 100]}
                      stroke={2}
                      draggable="true"
                      closed
                      x={Math.random() * 50}
                      y={Math.random() * 50}
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
  );
}

GridStage.propTypes = {
  shapes: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      id: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default GridStage;
