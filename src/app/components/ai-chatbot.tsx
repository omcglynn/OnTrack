import { useState, useRef, useEffect, useCallback } from 'react';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  Calendar,
  X 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sendMessageWithCodeExecution, generateScheduleRecommendation, AIScheduleRecommendation } from '@/app/lib/gemini';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'normal' | 'schedule-generation';
  scheduleData?: AIScheduleRecommendation;
}

interface AIChatbotProps {
  careerGoal?: string;
  userName?: string;
  major?: string;
  completedCourses?: string[];
  currentSemester?: number;
  existingCoursesInSemester?: string[];
  onScheduleGenerated?: (recommendation: AIScheduleRecommendation) => void;
}

export function AIChatbot({ 
  careerGoal, 
  userName, 
  major, 
  completedCourses, 
  currentSemester,
  existingCoursesInSemester = [],
  onScheduleGenerated 
}: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi ${userName || 'there'}! 👋 I'm your OnTrack AI advisor. I can help you with course selection, career planning, and academic questions. What would you like to know?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScheduleMode, setIsScheduleMode] = useState(false);
  const [schedulePrompt, setSchedulePrompt] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea up to 4 lines
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const maxHeight = 96;
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  // Adjust textarea height when input changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    setError(null);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const historyForApi = messages
        .slice(1)
        .filter(msg => msg.type !== 'schedule-generation')
        .map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

      const response = await sendMessageWithCodeExecution(
        textToSend,
        historyForApi,
        { userName, major, careerGoal, completedCourses, currentSemester }
      );

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      console.error('AI response error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to get AI response';
      setError(errorMessage);
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'm sorry, I encountered an error: ${errorMessage}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSchedule = async () => {
    if (!schedulePrompt.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `🗓️ Generate Schedule: "${schedulePrompt}"`,
      timestamp: new Date(),
      type: 'schedule-generation',
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const recommendation = await generateScheduleRecommendation(
        { userName, major, careerGoal, completedCourses, currentSemester },
        { 
          prompt: schedulePrompt, 
          targetCredits: 15,
          existingCoursesInSemester 
        }
      );

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `✨ I've generated a schedule for you!\n\n**Selected Courses (${recommendation.totalCredits} credits):**\n${recommendation.courseCodes.map(c => `• ${c}`).join('\n')}\n\n**Reasoning:** ${recommendation.reasoning}`,
        timestamp: new Date(),
        type: 'schedule-generation',
        scheduleData: recommendation,
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
      // Notify parent to open the preview modal
      if (onScheduleGenerated) {
        onScheduleGenerated(recommendation);
      }
      
      // Reset schedule mode
      setSchedulePrompt('');
      setIsScheduleMode(false);
    } catch (err) {
      console.error('Schedule generation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate schedule';
      setError(errorMessage);
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I couldn't generate a schedule: ${errorMessage}. Please try again with different criteria.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isScheduleMode) {
        handleGenerateSchedule();
      } else {
        handleSend();
      }
    }
  };

  return (
    <div className="w-96 bg-white border-l shadow-sm flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-purple-600 to-blue-600 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <Bot className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1 text-white">
            <h2 className="font-bold text-lg">AI Advisor</h2>
            <div className="flex items-center gap-1 text-xs text-purple-100">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Powered by Gemini</span>
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-yellow-300" />
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-2 bg-red-50 border-b border-red-200 flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{error}</span>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0 p-4 overflow-x-hidden">
        <div className="space-y-4 max-w-full">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'assistant' 
                  ? 'bg-gradient-to-br from-purple-600 to-blue-600' 
                  : 'bg-gradient-to-br from-blue-500 to-cyan-500'
              }`}>
                {message.role === 'assistant' ? (
                  <Bot className="w-5 h-5 text-white" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              
              <Card className={`flex-1 min-w-0 p-3 overflow-hidden ${
                message.role === 'user' 
                  ? 'bg-blue-50 border-blue-200' 
                  : message.type === 'schedule-generation'
                    ? 'bg-purple-50 border-purple-200'
                    : 'bg-white'
              }`}>
                <div className="text-sm leading-relaxed break-words overflow-wrap-anywhere [&>h1]:text-lg [&>h1]:font-bold [&>h1]:mt-3 [&>h1]:mb-2 [&>h2]:text-base [&>h2]:font-bold [&>h2]:mt-2 [&>h2]:mb-2 [&>h3]:text-sm [&>h3]:font-semibold [&>h3]:mt-2 [&>h3]:mb-1 [&>p]:my-2 [&>ul]:my-2 [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:my-2 [&>ol]:list-decimal [&>ol]:ml-4 [&>li]:my-1 [&>code]:text-purple-600 [&>code]:bg-purple-50 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-xs [&>code]:font-mono [&>pre]:bg-gray-900 [&>pre]:text-gray-100 [&>pre]:p-3 [&>pre]:rounded-lg [&>pre]:overflow-x-auto [&>pre]:my-2 [&>pre>code]:bg-transparent [&>pre>code]:text-gray-100 [&>pre>code]:p-0 [&>strong]:font-semibold [&>em]:italic [&>a]:text-blue-600 [&>a]:underline hover:[&>a]:text-blue-800 [&>blockquote]:border-l-4 [&>blockquote]:border-gray-300 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-2 [&>table]:w-full [&>table]:border-collapse [&>table]:my-2 [&>th]:border [&>th]:border-gray-300 [&>th]:px-2 [&>th]:py-1 [&>th]:bg-gray-100 [&>th]:text-left [&>td]:border [&>td]:border-gray-300 [&>td]:px-2 [&>td]:py-1">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
                {/* View Schedule Button for schedule generation responses */}
                {message.type === 'schedule-generation' && message.scheduleData && onScheduleGenerated && (
                  <Button
                    size="sm"
                    className="mt-3 w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    onClick={() => onScheduleGenerated(message.scheduleData!)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    View Generated Schedule
                  </Button>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </Card>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <Card className="flex-1 min-w-0 p-3 overflow-hidden">
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">
                    {isScheduleMode ? 'Generating schedule...' : 'AI is thinking...'}
                  </span>
                </div>
              </Card>
            </div>
          )}
          
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Schedule Generation Mode */}
      {isScheduleMode && (
        <div className="p-3 border-t bg-purple-50 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Generate Schedule
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsScheduleMode(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <textarea
            placeholder="Describe your ideal schedule... (e.g., 'Focus on cybersecurity with 15 credits')"
            value={schedulePrompt}
            onChange={(e) => setSchedulePrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={2}
            className="w-full resize-none rounded-md border border-purple-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          />
          <Button
            onClick={handleGenerateSchedule}
            disabled={!schedulePrompt.trim() || isLoading}
            className="w-full mt-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Generate Schedule
          </Button>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t bg-gray-50 flex-shrink-0">
        {/* Generate Schedule Button */}
        {!isScheduleMode && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mb-3 border-purple-300 text-purple-700 hover:bg-purple-50"
            onClick={() => setIsScheduleMode(true)}
            disabled={isLoading}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Generate Schedule with AI
          </Button>
        )}
        
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || isScheduleMode}
            rows={1}
            className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 overflow-y-auto"
            style={{ minHeight: '40px', maxHeight: '96px' }}
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading || isScheduleMode}
            size="icon"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
