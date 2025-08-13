import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoPath from "@assets/Emergent Transparent Logo_1755110400429.png";

interface HeaderProps {
  onVoiceToggle: () => void;
  isVoiceActive: boolean;
}

export default function Header({ onVoiceToggle, isVoiceActive }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <img 
                src={logoPath} 
                alt="Emergent Intelligence" 
                className="h-10 object-contain"
              />
              <div>
                <p className="text-sm text-muted-foreground">AI Task Manager</p>
              </div>
            </div>
          </div>

          {/* Voice Controls and Actions */}
          <div className="flex items-center space-x-4">
            {/* Voice Status Indicator */}
            <div className="flex items-center space-x-2 bg-muted px-3 py-2 rounded-lg">
              <div 
                className={`w-2 h-2 rounded-full ${isVoiceActive ? 'bg-green-400 animate-pulse-slow' : 'bg-green-400'}`}
                data-testid="indicator-voice-status"
              ></div>
              <span className="text-sm text-muted-foreground">
                {isVoiceActive ? 'Listening...' : 'Voice Ready'}
              </span>
            </div>
            
            {/* Voice Control Button */}
            <Button 
              onClick={onVoiceToggle}
              variant={isVoiceActive ? "secondary" : "default"}
              size="lg"
              className={`${isVoiceActive ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary/90'} text-white shadow-lg`}
              data-testid="button-voice-toggle"
            >
              {isVoiceActive ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
              <span className="ml-2 font-medium">
                {isVoiceActive ? 'Stop' : 'Voice'}
              </span>
            </Button>

            {/* User Menu */}
            <div className="relative">
              <button 
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-user-menu"
              >
                <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">JD</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
