import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Inbox, 
  Calendar, 
  Briefcase, 
  Home,
  Search,
  Plus
} from "lucide-react";

interface MobileNavProps {
  currentTab: "today" | "inbox" | "projects";
  onTabChange: (tab: "today" | "inbox" | "projects") => void;
  todayCount?: number;
  inboxCount?: number;
}

export function MobileNav({ currentTab, onTabChange, todayCount = 0, inboxCount = 0 }: MobileNavProps) {
  const tabs = [
    {
      id: "inbox" as const,
      label: "Inbox",
      icon: <Inbox className="h-5 w-5" />,
      count: inboxCount
    },
    {
      id: "today" as const,
      label: "Today",
      icon: <Calendar className="h-5 w-5" />,
      count: todayCount
    },
    {
      id: "projects" as const,
      label: "Projects",
      icon: <Briefcase className="h-5 w-5" />,
      count: 0
    }
  ];

  return (
    <div className="md:hidden fixed inset-x-0 bottom-0 bg-card border-t border-border z-40">
      <div className="grid grid-cols-3 h-16">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            onClick={() => onTabChange(tab.id)}
            className={`
              h-full rounded-none flex flex-col items-center justify-center gap-1 relative
              ${currentTab === tab.id ? 'text-primary bg-primary/10' : 'text-muted-foreground'}
            `}
            data-testid={`mobile-nav-${tab.id}`}
          >
            <div className="relative">
              {tab.icon}
              {tab.count > 0 && (
                <Badge 
                  className="absolute -top-2 -right-2 h-4 w-4 text-xs flex items-center justify-center p-0 bg-red-500 text-white"
                  data-testid={`badge-${tab.id}-count`}
                >
                  {tab.count > 99 ? "99+" : tab.count}
                </Badge>
              )}
            </div>
            <span className="text-xs font-medium">{tab.label}</span>
            
            {currentTab === tab.id && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full" />
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}