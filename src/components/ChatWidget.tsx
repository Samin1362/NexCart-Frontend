'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, LogIn, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const WELCOME: ChatMessage = {
  role: 'assistant',
  content: "Hi! I'm NexCart's AI shopping assistant. Ask me anything about our products or shopping.",
};

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-primary-accent"
          style={{
            animation: 'ai-dot-wave 1.2s ease-in-out infinite',
            animationDelay: `${i * 180}ms`,
          }}
        />
      ))}
    </div>
  );
}

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  const pushAssistant = (content: string) =>
    setMessages((prev) => [...prev, { role: 'assistant', content }]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setInput('');
    setSending(true);

    try {
      const { data } = await api.post('/ai/chat', { message: trimmed });
      pushAssistant(data.data?.reply || "Sorry, I couldn't generate a response. Please try again.");
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { message?: string } } };
      const status = error.response?.status;
      const serverMsg = error.response?.data?.message;

      if (status === 429) {
        pushAssistant("I'm a little busy right now. Please wait a moment and try again.");
      } else if (status === 401) {
        pushAssistant("Your session expired. Please log in again to continue.");
      } else if (status === 503) {
        pushAssistant("The AI service is temporarily unavailable. Please try again later.");
      } else if (!error.response) {
        pushAssistant("Can't reach the server. Make sure the backend is running.");
      } else {
        pushAssistant(serverMsg || "Something went wrong. Please try again.");
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* ── Floating Button ── */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 group cursor-pointer"
          aria-label="Open AI chat"
        >
          {/* Ping ring */}
          <span className="absolute inset-0 bg-primary-accent/25 animate-ping-soft" />
          {/* Button */}
          <span
            className="relative flex h-14 w-14 items-center justify-center bg-primary-accent text-white transition-all duration-300 group-hover:scale-105"
            style={{ boxShadow: '0 0 20px rgba(37,99,235,0.35), 0 4px 16px rgba(0,0,0,0.2)' }}
          >
            <Bot className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
          </span>
        </button>
      )}

      {/* ── Chat Panel ── */}
      {open && (
        <div
          className="animate-chat-slide-up fixed bottom-6 right-6 z-50 w-[360px] sm:w-[400px] flex flex-col border border-border bg-bg"
          style={{
            height: '540px',
            boxShadow: '0 0 0 1px rgba(37,99,235,0.12), 0 24px 48px rgba(0,0,0,0.18), 0 0 40px rgba(37,99,235,0.06)',
          }}
        >
          {/* ── Header ── */}
          <div
            className="relative flex items-center justify-between px-4 py-3 border-b border-white/[0.08] shrink-0 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #030712 0%, #0c1a4e 55%, #1e1b4b 100%)' }}
          >
            {/* Animated scan line */}
            <div className="animate-scan-line absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent pointer-events-none" />

            {/* Bot icon with rotating ring */}
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 shrink-0 flex items-center justify-center">
                <span className="absolute inset-0 border border-primary-accent/40 animate-spin-slow" />
                <span className="absolute inset-[3px] border border-white/[0.06]" />
                <Bot className="h-4 w-4 text-white relative z-10" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-white leading-tight tracking-wide">NexCart AI</p>
                  <Sparkles className="h-3 w-3 text-blue-300/70" />
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[10px] text-white/45 font-mono tracking-wider uppercase">Online · Gemini</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="relative z-10 h-8 w-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* ── Messages ── */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  'flex gap-2 items-end',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {/* AI avatar */}
                {msg.role === 'assistant' && (
                  <div className="h-7 w-7 shrink-0 flex items-center justify-center border border-primary-accent/30 bg-primary-accent/8 text-primary-accent mb-0.5">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}

                {/* Bubble */}
                {msg.role === 'assistant' ? (
                  <div className="relative max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed text-text-primary bg-bg-card border border-border border-l-2 border-l-primary-accent">
                    {/* Top shimmer line */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-primary-accent/40 via-primary-accent/10 to-transparent" />
                    {msg.content}
                  </div>
                ) : (
                  <div
                    className="max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed text-white"
                    style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%)' }}
                  >
                    {msg.content}
                  </div>
                )}

                {/* User avatar */}
                {msg.role === 'user' && (
                  <div className="h-7 w-7 shrink-0 flex items-center justify-center bg-primary-accent text-white rounded-full mb-0.5">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {sending && (
              <div className="flex gap-2 items-end justify-start">
                <div className="h-7 w-7 shrink-0 flex items-center justify-center border border-primary-accent/30 bg-primary-accent/8 text-primary-accent mb-0.5">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="relative bg-bg-card border border-border border-l-2 border-l-primary-accent px-4 py-3">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-primary-accent/40 via-primary-accent/10 to-transparent" />
                  <TypingDots />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Input area ── */}
          {user ? (
            <div className="border-t border-border bg-bg-card p-3 shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  disabled={sending}
                  className="flex-1 h-10 border border-border bg-bg px-3 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none disabled:opacity-50 transition-all duration-200"
                  style={{
                    // glow on focus is applied via JS below — we use inline style fallback
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary-accent)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '')}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="btn-shimmer h-10 w-10 flex items-center justify-center bg-primary-accent text-white transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 hover:opacity-90"
                  style={{ boxShadow: input.trim() && !sending ? '0 0 12px rgba(37,99,235,0.35)' : 'none' }}
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-center text-[10px] text-text-secondary/40 font-mono tracking-wider uppercase">
                Powered by Google Gemini
              </p>
            </div>
          ) : (
            /* Not logged in */
            <div className="border-t border-border p-4 shrink-0 bg-bg-card">
              <div className="flex items-center gap-2 justify-center mb-3">
                <span className="h-px flex-1 bg-border" />
                <p className="text-[10px] text-text-secondary/50 font-mono tracking-wider uppercase">
                  Sign in to chat
                </p>
                <span className="h-px flex-1 bg-border" />
              </div>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="btn-shimmer flex w-full h-10 items-center justify-center gap-2 bg-primary-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                style={{ boxShadow: '0 0 16px rgba(37,99,235,0.3)' }}
              >
                <LogIn className="h-4 w-4" />
                Sign In to Chat
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}
