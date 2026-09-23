'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { getConversation, sendMessage } from '@/lib/api';

interface ChatThreadProps {
  currentUserId: number;
  otherUserId: number;
  otherLabel?: string;
  heightClass?: string;
}

// Turn bare URLs in message text into clickable links (e.g. Google Meet links).
function renderContent(text: string) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="font-semibold underline break-all">
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function ChatThread({ currentUserId, otherUserId, otherLabel, heightClass = 'h-72' }: ChatThreadProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await getConversation(currentUserId, otherUserId);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load conversation:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, otherUserId]);

  useEffect(() => {
    setLoading(true);
    void load();
    const timer = setInterval(() => void load(), 10000);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const content = text.trim();
    if (!content) return;
    try {
      setSending(true);
      await sendMessage(currentUserId, otherUserId, content);
      setText('');
      await load();
    } catch (err: any) {
      console.error('Failed to send message:', err);
      alert(err?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className={`${heightClass} space-y-3 overflow-y-auto rounded-2xl bg-slate-50 p-4`}>
        {loading ? (
          <p className="text-sm text-slate-500">Loading conversation…</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-slate-500">No messages yet{otherLabel ? ` with ${otherLabel}` : ''}. Say hello to start the discussion.</p>
        ) : (
          messages.map((m) => {
            const mine = Number(m.senderId) === Number(currentUserId);
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${mine ? 'bg-[#0a66c2] text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>
                  <p className="whitespace-pre-wrap break-words">{renderContent(m.content)}</p>
                  {m.createdAt && <p className={`mt-1 text-[10px] ${mine ? 'text-blue-100' : 'text-slate-400'}`}>{new Date(m.createdAt).toLocaleString()}</p>}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend(); } }}
          rows={2}
          className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm"
          placeholder={`Message${otherLabel ? ` ${otherLabel}` : ''}…`}
        />
        <button onClick={handleSend} disabled={sending || !text.trim()} className="linkedin-button inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50">
          <Send className="h-4 w-4" />{sending ? '…' : 'Send'}
        </button>
      </div>
    </div>
  );
}
