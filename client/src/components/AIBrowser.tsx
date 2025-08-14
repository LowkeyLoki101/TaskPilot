import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Globe, Search, ArrowLeft, ArrowRight, RefreshCw, Shield, 
  Lock, AlertTriangle, Bot, Loader2, Home, Bookmark, 
  Eye, EyeOff, Download, Share2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BrowserTab {
  id: string;
  url: string;
  title: string;
  content: string;
  isLoading: boolean;
  isSecure: boolean;
}

export function AIBrowser() {
  const { toast } = useToast();
  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      id: "tab-1",
      url: "https://www.google.com",
      title: "Google",
      content: "",
      isLoading: false,
      isSecure: true
    }
  ]);
  const [activeTabId, setActiveTabId] = useState("tab-1");
  const [urlInput, setUrlInput] = useState("https://www.google.com");
  const [isAIBrowsing, setIsAIBrowsing] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [safeMode, setSafeMode] = useState(true);
  const [history, setHistory] = useState<string[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeTab = tabs.find(t => t.id === activeTabId);

  const handleNavigate = async (url: string) => {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    // Safety check
    if (safeMode) {
      const blockedDomains = ["facebook.com", "banking", "payment"];
      const isBlocked = blockedDomains.some(domain => url.includes(domain));
      if (isBlocked) {
        toast({
          title: "Blocked by Safe Mode",
          description: "This site is blocked for security reasons.",
          variant: "destructive"
        });
        return;
      }
    }

    setUrlInput(url);
    setHistory(prev => [...prev, url]);
    
    // Update active tab
    setTabs(prev => prev.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, url, isLoading: true, title: "Loading..." }
        : tab
    ));

    // Simulate loading
    setTimeout(() => {
      setTabs(prev => prev.map(tab => 
        tab.id === activeTabId 
          ? { 
              ...tab, 
              isLoading: false, 
              title: new URL(url).hostname,
              content: `Content from ${url}`,
              isSecure: url.startsWith("https://")
            }
          : tab
      ));
    }, 1000);
  };

  const handleAIBrowse = async () => {
    setIsAIBrowsing(true);
    setAiSummary("AI is analyzing the page...");
    
    // Simulate AI analysis
    setTimeout(() => {
      setAiSummary(`
        **Page Summary:**
        This is ${activeTab?.title || 'a webpage'}. 
        
        **Key Information:**
        - Domain: ${activeTab?.url ? new URL(activeTab.url).hostname : 'Unknown'}
        - Security: ${activeTab?.isSecure ? 'Secure (HTTPS)' : 'Not Secure'}
        - Content Type: Web Page
        
        **AI Recommendations:**
        - The page appears safe to browse
        - No suspicious elements detected
        - Content is suitable for general viewing
      `);
      setIsAIBrowsing(false);
    }, 2000);
  };

  const handleSearch = (query: string) => {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    handleNavigate(searchUrl);
  };

  const addNewTab = () => {
    const newTab: BrowserTab = {
      id: `tab-${Date.now()}`,
      url: "https://www.google.com",
      title: "New Tab",
      content: "",
      isLoading: false,
      isSecure: true
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setUrlInput("https://www.google.com");
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return;
    
    const tabIndex = tabs.findIndex(t => t.id === tabId);
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    
    if (activeTabId === tabId) {
      const newActiveTab = newTabs[Math.max(0, tabIndex - 1)];
      setActiveTabId(newActiveTab.id);
      setUrlInput(newActiveTab.url);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Browser Header */}
      <div className="border-b border-border bg-card p-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <span className="font-semibold">AI Browser</span>
            <Badge variant={safeMode ? "default" : "destructive"} className="text-xs">
              {safeMode ? "Safe Mode ON" : "Safe Mode OFF"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSafeMode(!safeMode)}
              data-testid="toggle-safe-mode"
            >
              {safeMode ? <Lock className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAIBrowse}
              disabled={isAIBrowsing}
              data-testid="ai-browse"
            >
              {isAIBrowsing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Bot className="h-3 w-3" />
              )}
              <span className="ml-1">AI Assist</span>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-2">
          <ScrollArea className="flex-1">
            <div className="flex gap-1">
              {tabs.map(tab => (
                <div
                  key={tab.id}
                  className={`flex items-center gap-1 px-3 py-1 rounded-t border cursor-pointer ${
                    activeTabId === tab.id 
                      ? 'bg-background border-border border-b-background' 
                      : 'bg-muted/50 border-transparent hover:bg-muted'
                  }`}
                  onClick={() => {
                    setActiveTabId(tab.id);
                    setUrlInput(tab.url);
                  }}
                >
                  {tab.isSecure ? (
                    <Lock className="h-3 w-3 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 text-yellow-500" />
                  )}
                  <span className="text-sm max-w-[150px] truncate">{tab.title}</span>
                  {tabs.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(tab.id);
                      }}
                      className="ml-1 hover:bg-muted rounded px-1"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <Button
                size="sm"
                variant="ghost"
                onClick={addNewTab}
                className="h-7 px-2"
              >
                +
              </Button>
            </div>
          </ScrollArea>
        </div>

        {/* Navigation Bar */}
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8"
            onClick={() => handleNavigate(urlInput)}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8"
            onClick={() => handleNavigate("https://www.google.com")}
          >
            <Home className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1">
            {activeTab?.isSecure && <Shield className="h-4 w-4 text-green-500" />}
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleNavigate(urlInput);
                }
              }}
              placeholder="Enter URL or search..."
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-7"
              data-testid="browser-url-input"
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => {
                if (urlInput.includes('.') || urlInput.startsWith('http')) {
                  handleNavigate(urlInput);
                } else {
                  handleSearch(urlInput);
                }
              }}
            >
              <Search className="h-3 w-3" />
            </Button>
          </div>

          <Button size="icon" variant="ghost" className="h-8 w-8">
            <Bookmark className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Browser Content */}
      <div className="flex-1 flex">
        <div className="flex-1 bg-white dark:bg-gray-900">
          {activeTab?.isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="h-full p-4">
              <div className="bg-muted/20 rounded-lg p-8 text-center">
                <Globe className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h2 className="text-2xl font-bold mb-2">AI-Powered Secure Browser</h2>
                <p className="text-muted-foreground mb-4">
                  This browser provides a safe environment for AI to browse the web on your behalf.
                </p>
                <div className="max-w-md mx-auto text-left space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Safe Mode blocks potentially harmful sites</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">AI can analyze and summarize page content</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-green-500" />
                    <span className="text-sm">HTTPS sites are marked as secure</span>
                  </div>
                </div>
                {activeTab?.url !== "https://www.google.com" && (
                  <div className="mt-6 p-4 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">Currently viewing:</p>
                    <p className="font-mono text-sm">{activeTab?.url}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* AI Summary Panel */}
        {aiSummary && (
          <div className="w-80 border-l border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">AI Analysis</h3>
            </div>
            <ScrollArea className="h-[calc(100%-2rem)]">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {aiSummary.split('\n').map((line, i) => (
                  <p key={i} className="text-sm mb-2">{line}</p>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* History Panel (collapsed by default) */}
      {history.length > 0 && (
        <div className="border-t border-border bg-card/50 p-2">
          <details>
            <summary className="cursor-pointer text-sm text-muted-foreground">
              Browser History ({history.length} items)
            </summary>
            <div className="mt-2 space-y-1">
              {history.slice(-5).reverse().map((url, i) => (
                <div 
                  key={i} 
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => handleNavigate(url)}
                >
                  {url}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}