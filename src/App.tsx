import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ChatMessage } from '@/components/ChatMessage'
import { TypingIndicator } from '@/components/TypingIndicator'
import { QuickActions } from '@/components/QuickActions'
import { ChatInput } from '@/components/ChatInput'
import { blink } from '@/blink/client'
import { Heart, Phone, Clock, MapPin } from 'lucide-react'

interface Message {
  id: string
  content: string
  isBot: boolean
  timestamp: Date
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auth state management
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setIsLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  // Initial welcome message
  useEffect(() => {
    if (user && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        content: `Hello! I'm your hospital assistant. I'm here to help you with:\n\n• Scheduling appointments\n• General medical inquiries\n• Hospital information and directions\n• Emergency contact information\n\nHow can I assist you today?`,
        isBot: true,
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }, [user, messages.length])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages, isTyping])

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isBot: false,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)

    try {
      // Generate AI response
      const { text } = await blink.ai.generateText({
        prompt: `You are a helpful hospital assistant chatbot. Respond professionally and empathetically to patient inquiries. 

Context: You work for a general hospital that provides:
- Emergency services (24/7)
- General practice appointments (Mon-Fri 8AM-6PM, Sat 9AM-2PM)
- Specialist consultations
- Diagnostic services
- Pharmacy services

Hospital contact info:
- Main number: (555) 123-4567
- Emergency: 911 or (555) 123-4911
- Address: 123 Medical Center Drive, Healthcare City, HC 12345

For appointment scheduling, collect: patient name, preferred date/time, reason for visit, and contact information.

User message: "${content}"

Provide a helpful, professional response. Keep it concise but informative.`,
        maxTokens: 300
      })

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: text,
        isBot: true,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error generating response:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I\'m having trouble responding right now. Please try again or contact our main number at (555) 123-4567 for immediate assistance.',
        isBot: true,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuickAction = (message: string) => {
    handleSendMessage(message)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Heart className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Hospital Assistant</h1>
              <p className="text-muted-foreground">Please sign in to continue</p>
            </div>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 animate-fade-in">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center animate-pulse-gentle">
                <Heart className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Hospital Assistant</h1>
                <p className="text-sm text-muted-foreground">24/7 Patient Support</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-accent/10 text-accent-foreground animate-pulse-gentle">
              <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
              Online
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 container mx-auto px-4 py-6 max-w-4xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <Card className="h-[calc(100vh-200px)] flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="flex-1 p-0 flex flex-col">
            {/* Messages */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={message.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <ChatMessage
                      message={message.content}
                      isBot={message.isBot}
                      timestamp={message.timestamp}
                    />
                  </div>
                ))}
                {isTyping && <TypingIndicator />}
              </div>
            </ScrollArea>

            <Separator />

            {/* Quick Actions */}
            <div className="p-4">
              <QuickActions onActionClick={handleQuickAction} />
              <ChatInput 
                onSendMessage={handleSendMessage} 
                disabled={isTyping}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 hover:text-foreground transition-colors duration-200">
              <Phone className="h-4 w-4 text-red-500" />
              <span>Emergency: 911</span>
            </div>
            <div className="flex items-center gap-2 hover:text-foreground transition-colors duration-200">
              <Phone className="h-4 w-4 text-primary" />
              <span>Main: (555) 123-4567</span>
            </div>
            <div className="flex items-center gap-2 hover:text-foreground transition-colors duration-200">
              <MapPin className="h-4 w-4 text-accent" />
              <span>123 Medical Center Drive</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App