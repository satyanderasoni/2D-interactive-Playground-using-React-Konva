import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "./ui/input";
import { Label } from "@/components/ui/label"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import "./RightSidebar.css"
import { Button } from "./ui/button";



function RightSidebar() {



  return (
    <div className="w-1/6">
      <Card className="h-full">
        <CardHeader>
          <h2 className="text-lg font-semibold">Properties</h2>
        </CardHeader>
        <CardContent className="space-y-4">
        <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
              <AccordionTrigger>Text Properties</AccordionTrigger>
              <AccordionContent className="grid grid-cols-3 gap-2">
              <div>
            <Label className='block mb-1' HTMLfor="color">Color</Label>
            <Input type="color" />
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
         <div>
            <Button className=' items-baseline'  >Export</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



export default RightSidebar