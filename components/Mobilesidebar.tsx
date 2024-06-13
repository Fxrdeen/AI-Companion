import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import Sidebar from "./Sidebar";
const Mobilesidebar = () => {
  return (
    <Sheet>
      <SheetTrigger asChild className="md:hidden pr-4">
        <Menu className="h-10 w-10" />
      </SheetTrigger>
      <SheetContent side={"left"} className="p-0 bg-secondary pt-10 w-32">
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
};

export default Mobilesidebar;
