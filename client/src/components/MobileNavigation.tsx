import { useState } from "react";
import { ChevronLeft, ChevronRight, Home, Calendar, CheckSquare, FolderOpen, Bot, Bug, BarChart3, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface MobileNavigationProps {
  currentModule: string;
  onModuleChange: (module: string) => void;
  className?: string;
}

export function MobileNavigation({ currentModule, onModuleChange, className }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const modules = [
    { id: 'mindmap', label: 'Mind Map', icon: Home },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'agents', label: 'AI Agents', icon: Bot },
    { id: 'diagnostics', label: 'Diagnostics', icon: Bug },
    { id: 'browser', label: 'Browser', icon: BarChart3 },
  ];

  const currentIndex = modules.findIndex(m => m.id === currentModule);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < modules.length - 1;

  const handlePrev = () => {
    if (canGoPrev) {
      onModuleChange(modules[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onModuleChange(modules[currentIndex + 1].id);
    }
  };

  const CurrentIcon = modules[currentIndex]?.icon || Home;

  return (
    <div className={cn("flex items-center justify-between px-2 py-1 bg-card border-t", className)}>
      {/* Previous Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePrev}
        disabled={!canGoPrev}
        className="h-8 w-8"
        data-testid="mobile-nav-prev"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Current Module with Menu */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 px-3"
            data-testid="mobile-nav-menu"
          >
            <CurrentIcon className="h-4 w-4" />
            <span className="text-sm font-medium">{modules[currentIndex]?.label || 'Home'}</span>
            <Menu className="h-3 w-3" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[300px]">
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Button
                  key={module.id}
                  variant={currentModule === module.id ? "default" : "outline"}
                  className="h-20 flex flex-col gap-2"
                  onClick={() => {
                    onModuleChange(module.id);
                    setIsOpen(false);
                  }}
                  data-testid={`mobile-nav-${module.id}`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs">{module.label}</span>
                </Button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      {/* Next Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleNext}
        disabled={!canGoNext}
        className="h-8 w-8"
        data-testid="mobile-nav-next"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}