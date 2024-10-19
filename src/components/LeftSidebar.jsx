import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";

import {  PropTypes } from 'prop-types';

function LeftSidebar({ onAddShape }) {

  return (
    <div className="w-1/6">
      <Card className="h-full">
        <CardHeader>
          <h2 className="text-lg font-semibold">Tools</h2>
        </CardHeader>
        <CardContent >
<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Basic Shapes</AccordionTrigger>
    <AccordionContent className="grid grid-cols-3 gap-2">
         <Button variant="outline">
            <Icons.SquareIcon size={24} onClick={() => onAddShape("square")} />
          </Button>
          <Button variant="outline">
            <Icons.Circle size={24} onClick={() => onAddShape("circle")} />
          </Button>
          <Button variant="outline"> 
            <Icons.Triangle size={24} onClick={() => onAddShape("triangle")} />
          </Button>
    </AccordionContent>
  </AccordionItem>
</Accordion>
<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Text</AccordionTrigger>
    <AccordionContent className="grid grid-cols-3 gap-2">
         <Button variant="outline">
            <Icons.Type size={24} />
          </Button>
    </AccordionContent>
  </AccordionItem>
</Accordion>
<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Stalls</AccordionTrigger>
    <AccordionContent className="grid grid-cols-3 gap-2">
    </AccordionContent>
  </AccordionItem>
</Accordion>
<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Navigation</AccordionTrigger>
    <AccordionContent className="grid grid-cols-3 gap-2">
    <Button variant="outline">
            <Icons.ArrowUp size={24} />
          </Button>         <Button variant="outline">
            <Icons.ArrowDown size={24} />
          </Button>         <Button variant="outline">
            <Icons.ArrowRight size={24} />
          </Button>         <Button variant="outline">
            <Icons.ArrowLeft size={24} />
          </Button>
    </AccordionContent>
  </AccordionItem>
</Accordion>
        </CardContent>
      </Card>
    </div>
  )
}

LeftSidebar.propTypes = {
  onAddShape: PropTypes.func.isRequired,
};

export default LeftSidebar
