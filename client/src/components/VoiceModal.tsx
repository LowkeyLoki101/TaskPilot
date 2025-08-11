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
              {isListening ? 'Listening...' : transcript ? 'Processing...' : 'Voice Ready'}
            </h3>
            <p className="text-muted-foreground text-sm">
              {isListening ? 'Speak naturally - AI will auto-organize when you finish' : 
               transcript ? 'AI is automatically processing and organizing your request' :
               'Just speak - no clicks needed, AI handles everything'}
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
              {transcript ? (
                <span>
                  <span className="text-blue-600">📝</span> {transcript}
                  {!isListening && <span className="text-green-600 ml-2">✨ AI processing...</span>}
                </span>
              ) : "Start speaking..."}
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
            ) : transcript ? (
              <div className="flex-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg font-medium text-center">
                <i className="fas fa-sparkles mr-2"></i>Auto-Processing
              </div>
            ) : (
              <button 
                onClick={onClose}
                className="flex-1 bg-muted hover:bg-accent text-foreground px-4 py-2 rounded-lg font-medium transition-colors"
                data-testid="button-voice-ready"
              >
                <i className="fas fa-microphone mr-2"></i>Start Speaking
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
