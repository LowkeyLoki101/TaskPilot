interface VoiceModalProps {
  isListening: boolean;
  transcript: string;
  onClose: () => void;
  onStop: () => void;
  onProcess: () => void;
}

export default function VoiceModal({ 
  isListening, 
  transcript, 
  onClose, 
  onStop, 
  onProcess 
}: VoiceModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mb-6">
            <div className="w-24 h-24 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
              <i className="fas fa-microphone text-white text-3xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {isListening ? 'Listening...' : 'Voice Input'}
            </h3>
            <p className="text-muted-foreground text-sm">
              Speak naturally to create tasks or ask questions
            </p>
          </div>

          {/* Voice Waveform Animation */}
          {isListening && (
            <div className="flex justify-center space-x-1 mb-6">
              {[0, 0.1, 0.2, 0.3, 0.4].map((delay, index) => (
                <div
                  key={index}
                  className="w-1 bg-primary rounded-full animate-pulse"
                  style={{
                    height: `${20 + Math.random() * 15}px`,
                    animationDelay: `${delay}s`,
                  }}
                ></div>
              ))}
            </div>
          )}

          {/* Transcript */}
          <div className="bg-muted rounded-lg p-4 mb-6 min-h-16">
            <p className="text-foreground text-sm">
              {transcript || "Start speaking..."}
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button 
              onClick={onClose}
              className="flex-1 bg-muted hover:bg-accent text-foreground px-4 py-2 rounded-lg font-medium transition-colors"
              data-testid="button-voice-close"
            >
              <i className="fas fa-times mr-2"></i>Close
            </button>
            {isListening ? (
              <button 
                onClick={onStop}
                className="flex-1 bg-secondary hover:bg-secondary-600 text-secondary-foreground px-4 py-2 rounded-lg font-medium transition-colors"
                data-testid="button-voice-stop"
              >
                <i className="fas fa-stop mr-2"></i>Stop
              </button>
            ) : (
              <button 
                onClick={onProcess}
                disabled={!transcript.trim()}
                className="flex-1 bg-primary hover:bg-primary-600 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                data-testid="button-voice-process"
              >
                <i className="fas fa-check mr-2"></i>Process
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
