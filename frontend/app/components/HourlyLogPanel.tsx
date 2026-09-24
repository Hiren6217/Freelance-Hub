'use client';

import { useCallback, useEffect, useState } from 'react';
import { Clock3, Loader2, Plus } from 'lucide-react';
import {
  getContractPayments,
  getContractTimeLogs,
  logHours,
  type Payment,
  type TimeLog,
} from '@/lib/api';

interface HourlyLogPanelProps {
  contractId: number;
  currency: string;
  rate: number | string;
}

const paymentBadge = (status?: string) => {
  switch (status) {
    case 'PAID':
      return 'bg-green-100 text-green-700';
    case 'DUE':
      return 'bg-amber-100 text-amber-700';
    case 'PROCESSING':
      return 'bg-blue-100 text-blue-700';
    case 'FAILED':
      return 'bg-orange-100 text-orange-700';
    default:
      return 'bg-slate-200 text-slate-700';
  }
};

export default function HourlyLogPanel({ contractId, currency, rate }: HourlyLogPanelProps) {
  const [logs, setLogs] = useState<TimeLog[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [hours, setHours] = useState('1');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [logsData, paymentsData] = await Promise.all([
        getContractTimeLogs(contractId),
        getContractPayments(contractId),
      ]);
      setLogs(Array.isArray(logsData) ? logsData : []);
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load time logs.');
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    void load();
  }, [load]);

  const paymentForLog = (logId: number) => payments.find((p) => Number(p.timeLogId) === Number(logId));

  const handleLog = async () => {
    const parsedHours = parseFloat(hours);
    if (!Number.isFinite(parsedHours) || parsedHours <= 0) {
      setError('Enter a valid number of hours greater than 0.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      await logHours({ contractId, hours: parsedHours, description: description.trim() || undefined });
      setHours('1');
      setDescription('');
      await load();
    } catch (err: any) {
      setError(err?.message || 'Failed to log hours.');
    } finally {
      setSubmitting(false);
    }
  };

  const rateNum = Number(rate) || 0;

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Clock3 className="h-4 w-4 text-[#0a66c2]" />Log worked hours</p>
      <p className="mt-1 text-xs text-slate-500">Each logged block bills the client {currency} {rateNum.toFixed(2)}/hr and must be released through the platform.</p>

      {error && <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</div>}

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Hours</label>
          <input type="number" min="0.25" step="0.25" value={hours} onChange={(e) => setHours(e.target.value)} className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div className="min-w-[180px] flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-600">Description (optional)</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="What did you work on?" />
        </div>
        <button onClick={handleLog} disabled={submitting} className="linkedin-button inline-flex items-center gap-2 disabled:opacity-50">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Log hours
        </button>
      </div>

      <div className="mt-4">
        {loading ? (
          <p className="text-xs text-slate-500">Loading logged hours…</p>
        ) : logs.length === 0 ? (
          <p className="text-xs text-slate-500">No hours logged yet.</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => {
              const payment = paymentForLog(log.id);
              return (
                <div key={log.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 p-3 text-sm">
                  <div>
                    <p className="font-semibold text-slate-700">{Number(log.hours).toFixed(2)} hr{log.description ? ` · ${log.description}` : ''}</p>
                    <p className="text-xs text-slate-500">{payment ? `${payment.currency} ${Number(payment.amount).toFixed(2)} · you net ${payment.currency} ${Number(payment.developerEarnings).toFixed(2)}` : 'Payment pending creation'}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentBadge(payment?.status)}`}>{payment?.status || 'PENDING'}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
