import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, Mic, Edit2, Save, X, User, 
  Volume2, FileAudio, Clock, Users 
} from "lucide-react";

interface Speaker {
  id: string;
  name: string;
  color: string;
}

interface TranscriptionSegment {
  id: string;
  speakerId: string;
  text: string;
  timestamp: number;
  duration: number;
}

export function VoiceTranscription() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<TranscriptionSegment[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([
    { id: "speaker-1", name: "Speaker 1", color: "bg-blue-500" },
    { id: "speaker-2", name: "Speaker 2", color: "bg-green-500" }
  ]);
  const [editingSegment, setEditingSegment] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingSpeaker, setEditingSpeaker] = useState<string | null>(null);
  const [newSpeakerName, setNewSpeakerName] = useState("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
      processAudioFile(file);
    }
  };

  const processAudioFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', file);
      
      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        setTranscription(data.segments);
        setSpeakers(data.speakers);
        
        toast({
          title: "Transcription Complete",
          description: `Processed ${data.segments.length} segments with ${data.speakers.length} speakers identified`
        });
      }
    } catch (error) {
      toast({
        title: "Transcription Failed",
        description: "Failed to process the audio file",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditSegment = (segmentId: string) => {
    const segment = transcription.find(s => s.id === segmentId);
    if (segment) {
      setEditingSegment(segmentId);
      setEditingText(segment.text);
    }
  };

  const saveSegmentEdit = () => {
    if (editingSegment) {
      setTranscription(prev => prev.map(segment => 
        segment.id === editingSegment 
          ? { ...segment, text: editingText }
          : segment
      ));
      setEditingSegment(null);
    }
  };

  const handleEditSpeaker = (speakerId: string) => {
    const speaker = speakers.find(s => s.id === speakerId);
    if (speaker) {
      setEditingSpeaker(speakerId);
      setNewSpeakerName(speaker.name);
    }
  };

  const saveSpeakerEdit = () => {
    if (editingSpeaker) {
      setSpeakers(prev => prev.map(speaker => 
        speaker.id === editingSpeaker 
          ? { ...speaker, name: newSpeakerName }
          : speaker
      ));
      setEditingSpeaker(null);
    }
  };

  const batchUpdateSpeaker = (oldSpeakerId: string, newSpeakerId: string) => {
    setTranscription(prev => prev.map(segment => 
      segment.speakerId === oldSpeakerId 
        ? { ...segment, speakerId: newSpeakerId }
        : segment
    ));
    
    toast({
      title: "Speaker Updated",
      description: "All segments have been updated with the new speaker"
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Voice Transcription
          </div>
          <div className="flex gap-2">
            <Input
              type="file"
              accept="audio/*,.m4a,.mp3,.wav,.webm"
              onChange={handleFileUpload}
              className="hidden"
              id="audio-upload"
            />
            <Label htmlFor="audio-upload">
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-1" />
                  Upload Audio
                </span>
              </Button>
            </Label>
            <Button variant="outline" size="sm">
              <Mic className="h-4 w-4 mr-1" />
              Record
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Speaker Management */}
        <div className="border rounded-lg p-3 bg-muted/30">
          <div className="text-sm font-medium mb-2 flex items-center gap-1">
            <Users className="h-4 w-4" />
            Identified Speakers
          </div>
          <div className="flex flex-wrap gap-2">
            {speakers.map(speaker => (
              <div key={speaker.id} className="flex items-center gap-1">
                <Badge className={`${speaker.color} text-white`}>
                  {editingSpeaker === speaker.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={newSpeakerName}
                        onChange={(e) => setNewSpeakerName(e.target.value)}
                        className="h-5 w-24 text-xs"
                        onKeyDown={(e) => e.key === 'Enter' && saveSpeakerEdit()}
                      />
                      <Button size="sm" variant="ghost" onClick={saveSpeakerEdit}>
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingSpeaker(null)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {speaker.name}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleEditSpeaker(speaker.id)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Transcription Display */}
        <ScrollArea className="flex-1 border rounded-lg p-4">
          {isProcessing ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <FileAudio className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                <p className="text-sm text-muted-foreground">Processing audio...</p>
              </div>
            </div>
          ) : transcription.length > 0 ? (
            <div className="space-y-3">
              {transcription.map(segment => {
                const speaker = speakers.find(s => s.id === segment.speakerId);
                return (
                  <div key={segment.id} className="flex gap-3 group">
                    <div className="flex-shrink-0">
                      <Badge className={`${speaker?.color || 'bg-gray-500'} text-white`}>
                        {speaker?.name || 'Unknown'}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(segment.timestamp)}
                      </div>
                    </div>
                    <div className="flex-1">
                      {editingSegment === segment.id ? (
                        <div className="flex gap-2">
                          <Textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="flex-1 text-sm"
                            rows={2}
                          />
                          <div className="flex flex-col gap-1">
                            <Button size="sm" onClick={saveSegmentEdit}>
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => setEditingSegment(null)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <p className="text-sm">{segment.text}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute -right-2 -top-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleEditSegment(segment.id)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : audioFile ? (
            <div className="text-center text-muted-foreground">
              <FileAudio className="h-8 w-8 mx-auto mb-2" />
              <p>Ready to transcribe: {audioFile.name}</p>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <Upload className="h-8 w-8 mx-auto mb-2" />
              <p>Upload an audio file or record to start transcription</p>
              <p className="text-xs mt-1">Supports iPhone voice memos and recordings</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}