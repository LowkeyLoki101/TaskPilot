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
              <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">EI</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Emergent Intelligence</h1>
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
            <button 
              onClick={onVoiceToggle}
              className={`${isVoiceActive ? 'bg-secondary hover:bg-secondary-600' : 'bg-primary hover:bg-primary-600'} text-white p-3 rounded-lg transition-colors duration-200`}
              data-testid="button-voice-toggle"
            >
              <i className="fas fa-microphone text-lg"></i>
            </button>

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
