'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessagesSquare, Search } from 'lucide-react';
import { getMessageThreads, markConversationRead } from '@/lib/api';
import ChatThread from '@/app/components/ChatThread';

interface Thread {
  otherUserId: number;
  otherUserName: string;
  otherUserRole?: string | null;
  lastMessage: string;
  lastMessageAt?: string | null;
  lastMessageMine?: boolean;
  unreadCount?: number;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

function timeLabel(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay ? d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : d.toLocaleDateString();
}

export default function MessagesPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [dashboardPath, setDashboardPath] = useState('/dashboard');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeOther, setActiveOther] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const loadThreads = useCallback(async (uid: number) => {
    try {
      const data = await getMessageThreads(uid);
      setThreads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load message threads:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const id = localStorage.getItem('userId');
    const parsed = id ? parseInt(id, 10) : null;
    if (!parsed) { router.push('/login'); return; }
    setUserId(parsed);
    setDashboardPath(role === 'CLIENT' ? '/dashboard/client' : role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/developer');

    const withParam = new URLSearchParams(window.location.search).get('with');
    const w = withParam ? parseInt(withParam, 10) : NaN;
    if (!Number.isNaN(w)) {
      setActiveOther(w);
      void markConversationRead(parsed, w).catch(() => {});
    }

    void loadThreads(parsed);
    const timer = setInterval(() => void loadThreads(parsed), 15000);
    return () => clearInterval(timer);
  }, [router, loadThreads]);

  const openThread = useCallback(async (otherId: number) => {
    setActiveOther(otherId);
    if (!userId) return;
    setThreads((prev) => prev.map((t) => (t.otherUserId === otherId ? { ...t, unreadCount: 0 } : t)));
    try {
      await markConversationRead(userId, otherId);
    } catch (err) {
      console.error('Failed to mark conversation read:', err);
    }
  }, [userId]);

  const activeThread = useMemo(() => threads.find((t) => t.otherUserId === activeOther) || null, [threads, activeOther]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((t) => t.otherUserName.toLowerCase().includes(q) || (t.lastMessage || '').toLowerCase().includes(q));
  }, [threads, query]);
  const totalUnread = useMemo(() => threads.reduce((sum, t) => sum + (t.unreadCount || 0), 0), [threads]);

  return (
    <main className="min-h-screen py-6">
      <div className="page-shell">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MessagesSquare className="h-6 w-6 text-[#0a66c2]" />
            <h1 className="text-2xl font-semibold">Messages</h1>
            {totalUnread > 0 && <span className="rounded-full bg-[#0a66c2] px-2 py-0.5 text-xs font-semibold text-white">{totalUnread}</span>}
          </div>
          <Link href={dashboardPath} className="linkedin-button-secondary inline-flex items-center gap-2"><ArrowLeft className="h-4 w-4" />Back to dashboard</Link>
        </div>

        <div className="surface-card overflow-hidden p-0 md:grid md:grid-cols-[340px_1fr]">
          <div className={`${activeOther ? 'hidden md:block' : 'block'} md:border-r md:border-slate-200`}>
            <div className="border-b border-slate-200 p-4">
              <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
                <Search className="h-4 w-4 text-slate-400" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search messages" className="w-full bg-transparent text-sm outline-none" />
              </div>
            </div>
            <div className="max-h-[65vh] overflow-y-auto">
              {loading ? (
                <p className="p-4 text-sm text-slate-500">Loading conversations…</p>
              ) : filtered.length === 0 ? (
                <p className="p-4 text-sm text-slate-500">No conversations yet. Start chatting from an application, interview, or contract.</p>
              ) : (
                filtered.map((t) => (
                  <button key={t.otherUserId} onClick={() => void openThread(t.otherUserId)} className={`flex w-full items-center gap-3 border-b border-slate-100 p-4 text-left hover:bg-slate-50 ${t.otherUserId === activeOther ? 'bg-[#e8f3ff]' : ''}`}>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0a66c2] text-sm font-semibold text-white">{initials(t.otherUserName)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate font-semibold text-slate-800">{t.otherUserName}</span>
                        <span className="shrink-0 text-[10px] text-slate-400">{timeLabel(t.lastMessageAt)}</span>
                      </span>
                      <span className="mt-0.5 flex items-center justify-between gap-2">
                        <span className={`truncate text-sm ${t.unreadCount ? 'font-semibold text-slate-700' : 'text-slate-500'}`}>{t.lastMessageMine ? 'You: ' : ''}{t.lastMessage}</span>
                        {t.unreadCount ? <span className="shrink-0 rounded-full bg-[#0a66c2] px-2 py-0.5 text-[10px] font-semibold text-white">{t.unreadCount}</span> : null}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className={`${activeOther ? 'block' : 'hidden md:block'} p-4`}>
            {activeOther && userId ? (
              <>
                <div className="mb-3 flex items-center gap-3">
                  <button onClick={() => setActiveOther(null)} className="inline-flex items-center gap-1 text-sm font-semibold text-[#0a66c2] md:hidden"><ArrowLeft className="h-4 w-4" />Back</button>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0a66c2] text-xs font-semibold text-white">{initials(activeThread?.otherUserName || 'User')}</span>
                  <div>
                    <p className="font-semibold text-slate-800">{activeThread?.otherUserName || `User #${activeOther}`}</p>
                    {activeThread?.otherUserRole ? <p className="text-xs text-slate-500">{activeThread.otherUserRole}</p> : null}
                  </div>
                </div>
                <ChatThread currentUserId={userId} otherUserId={activeOther} otherLabel={activeThread?.otherUserName} heightClass="h-[60vh]" />
              </>
            ) : (
              <div className="flex h-[60vh] flex-col items-center justify-center text-center text-slate-500">
                <MessagesSquare className="h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm">Select a conversation to read and reply.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
