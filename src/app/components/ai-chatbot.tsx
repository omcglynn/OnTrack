import { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatbotProps {
  careerGoal?: string;
  userName?: string;
  major?: string;
}

export function AIChatbot({ careerGoal, userName, major }: AIChatbotProps) {
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
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  // Generate AI response based on user input
  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Course recommendations
    if (lowerMessage.includes('course') || lowerMessage.includes('class') || lowerMessage.includes('take')) {
      if (lowerMessage.includes('next') || lowerMessage.includes('recommend')) {
        return `Based on your ${careerGoal || 'career'} goals, I recommend focusing on courses that build both technical depth and practical skills. Here are some key areas:\n\n• Advanced algorithms and data structures for problem-solving\n• Web/mobile development for building portfolios\n• Database management for backend skills\n• Machine learning if interested in AI\n\nWould you like specific course suggestions for next semester?`;
      }
      if (lowerMessage.includes('machine learning') || lowerMessage.includes('ml') || lowerMessage.includes('ai')) {
        return `Great choice! For machine learning, I recommend this path:\n\n1. **CIS 3715** - Principles of Data Science (prerequisite)\n2. **CIS 4909** - Machine Learning (advanced)\n\nThese courses will give you hands-on experience with Python, TensorFlow, and real-world ML projects. They're highly relevant for ${careerGoal || 'tech careers'}!`;
      }
      if (lowerMessage.includes('web') || lowerMessage.includes('frontend') || lowerMessage.includes('react')) {
        return `For web development, check out **CIS 4398 - Web Application Development**! It covers:\n\n• React and modern JavaScript\n• Node.js backend\n• Full-stack project experience\n• RESTful API design\n\nThis course has a 100% career relevance score for Full Stack Developer roles and will help build your portfolio.`;
      }
    }

    // Career advice
    if (lowerMessage.includes('career') || lowerMessage.includes('job') || lowerMessage.includes('internship')) {
      return `For ${careerGoal || 'your career goals'}, here's my advice:\n\n**Build Your Foundation:**\n• Master data structures & algorithms\n• Complete 2-3 substantial projects\n• Contribute to open source\n\n**Get Experience:**\n• Apply for internships in junior/senior year\n• Join hackathons and coding competitions\n• Network at career fairs\n\n**Technical Skills:**\n• Learn industry-standard tools\n• Build a strong GitHub portfolio\n• Practice coding interviews\n\nWant specific tips for ${careerGoal || 'your field'}?`;
    }

    // Prerequisites and planning
    if (lowerMessage.includes('prerequisite') || lowerMessage.includes('prereq') || lowerMessage.includes('before')) {
      return `Prerequisites are important for course planning! Here's how to check them:\n\n• Each course card shows required prerequisites\n• Take them in sequence for best understanding\n• Some courses have co-requisites (can take together)\n\nFor example, CIS 2168 (Data Structures) requires both CIS 1057 and CIS 2033. Need help planning a specific sequence?`;
    }

    // Difficulty and workload
    if (lowerMessage.includes('difficult') || lowerMessage.includes('hard') || lowerMessage.includes('workload') || lowerMessage.includes('easy')) {
      return `Course difficulty varies by person, but here's my general advice:\n\n**Difficulty Levels:**\n• 1-2: Introductory, manageable workload\n• 3: Moderate, requires consistent effort\n• 4-5: Challenging, time-intensive\n\n**Balancing Your Load:**\n• Mix difficult and easier courses each semester\n• Don't overload during internship prep\n• Consider prerequisites and time management\n\nWhich specific course difficulty are you concerned about?`;
    }

    // GPA and grades
    if (lowerMessage.includes('gpa') || lowerMessage.includes('grade')) {
      return `Maintaining a strong GPA is important! Here are some tips:\n\n• Start strong in foundational courses\n• Attend office hours regularly\n• Form study groups\n• Balance difficulty across semesters\n• Don't overload your schedule\n\nFor ${careerGoal || 'tech roles'}, many companies look for 3.0+ GPA, but practical skills and projects matter more. Focus on learning and building!`;
    }

    // Study tips
    if (lowerMessage.includes('study') || lowerMessage.includes('prepare') || lowerMessage.includes('tips')) {
      return `Here are my top study tips for CS students:\n\n**Code Daily:**\n• Practice on LeetCode/HackerRank\n• Build personal projects\n• Review course material regularly\n\n**Learn Actively:**\n• Don't just read—implement!\n• Teach concepts to others\n• Debug your own code\n\n**Resources:**\n• Use office hours\n• Join study groups\n• YouTube tutorials for tough concepts\n\nWhat subject do you need help with?`;
    }

    // Schedule and planning
    if (lowerMessage.includes('schedule') || lowerMessage.includes('plan') || lowerMessage.includes('semester')) {
      return `Smart scheduling is key to success! Here's my approach:\n\n**Balanced Semester:**\n• Mix 2-3 major courses with 1-2 gen-eds\n• Aim for 15-16 credits typically\n• Leave room for clubs/projects\n\n**Before Internships:**\n• Take slightly lighter loads\n• Focus on interview prep\n• Build portfolio projects\n\nYour current plan is optimized for ${careerGoal || 'your goals'}. Want to adjust anything?`;
    }

    // Default responses
    const defaultResponses = [
      `That's a great question! For ${careerGoal || major || 'Computer Science'} students, I'd be happy to help. Could you be more specific about what you'd like to know? I can assist with:\n\n• Course recommendations and planning\n• Career advice and internships\n• Prerequisites and degree requirements\n• Study tips and resources`,
      
      `I'm here to help with your academic journey! Some things I can help with:\n\n• Finding courses for ${careerGoal || 'your career path'}\n• Understanding prerequisites\n• Planning your semester schedule\n• Career preparation tips\n\nWhat specific area interests you?`,
      
      `Thanks for your question! As your AI advisor, I can provide guidance on courses, career planning, and academic success. What aspect of your ${major || 'Computer Science'} journey would you like to explore?`,
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateResponse(userMessage.content),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
              <span>Online</span>
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-yellow-300" />
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0 p-4">
        <div className="space-y-4">
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
              
              <Card className={`flex-1 p-3 ${
                message.role === 'user' 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-white'
              }`}>
                <p className="text-sm whitespace-pre-line leading-relaxed">
                  {message.content}
                </p>
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
              <Card className="flex-1 p-3">
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </Card>
            </div>
          )}
          
          {/* Invisible div for scroll anchor */}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-gray-50 flex-shrink-0">
        <div className="flex gap-2">
          <Input
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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