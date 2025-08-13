import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import LogoEmergent from "./LogoEmergent";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  onVoiceToggle: () => void;
  isVoiceActive: boolean;
}

export default function Header({ onVoiceToggle, isVoiceActive }: HeaderProps) {
  const isMobile = useIsMobile();
  
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <LogoEmergent size={isMobile ? 'sm' : 'md'} />

          {/* Voice Controls and Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Voice Status Indicator - Hidden on small mobile */}
            <div className="hidden sm:flex items-center space-x-2 bg-muted px-3 py-2 rounded-lg">
              <div 
                className={`w-2 h-2 rounded-full ${isVoiceActive ? 'bg-green-400 animate-pulse-slow' : 'bg-green-400'}`}
                data-testid="indicator-voice-status"
              ></div>
              <span className="text-sm text-muted-foreground">
                {isVoiceActive ? 'Listening...' : 'Voice Ready'}
              </span>
            </div>
            
            {/* Voice Control Button - Compact on mobile */}
            <Button 
              onClick={onVoiceToggle}
              variant={isVoiceActive ? "secondary" : "default"}
              size="default"
              className={`${isVoiceActive ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary/90'} text-white shadow-lg px-3 sm:px-4`}
              data-testid="button-voice-toggle"
            >
              {isVoiceActive ? (
                <MicOff className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
              <span className="ml-1 sm:ml-2 font-medium text-sm sm:text-base">
                {isVoiceActive ? 'Stop' : 'Voice'}
              </span>
            </Button>

            {/* User Menu - Smaller on mobile */}
            <div className="relative">
              <button 
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-user-menu"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 gradient-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-xs sm:text-sm font-medium">JD</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
