'use client';

import { useCallback, useEffect, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  capturePayment,
  createPaymentOrder,
  getClientPayments,
  type Payment,
} from '@/lib/api';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';

interface PayDuesProps {
  clientId: number;
  // Called after a payment is captured so parents can re-check suspension state.
  onPaid?: () => void;
}

const typeLabel = (payment: Payment) =>
  payment.type === 'HOURLY' ? 'Hourly work' : 'Project completion';

export default function PayDues({ clientId, onPaid }: PayDuesProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await getClientPayments(clientId);
      setPayments(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load payments.');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    void load();
  }, [load]);

  const dues = payments.filter((p) => p.status === 'DUE' || p.status === 'PROCESSING');
  const history = payments.filter((p) => p.status === 'PAID');

  if (loading) {
    return <p className="text-sm text-slate-500">Loading payments…</p>;
  }

  return (
    <div className="space-y-4">
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
      {message && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{message}</span>
        </div>
      )}

      {dues.length > 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <span className="inline-flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            You have {dues.length} payment{dues.length > 1 ? 's' : ''} to release through the platform. Clear {dues.length > 1 ? 'them' : 'it'} to keep your account active.
          </span>
        </div>
      ) : (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />No payments due. Your account is in good standing.</span>
        </div>
      )}

      {dues.length > 0 && !PAYPAL_CLIENT_ID && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          Online payments are not configured yet (missing <code>NEXT_PUBLIC_PAYPAL_CLIENT_ID</code>). Add a PayPal sandbox client ID to <code>.env.local</code> to enable the pay buttons.
        </div>
      )}

      {dues.length > 0 && PAYPAL_CLIENT_ID && (
        <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: dues[0].currency || 'USD', intent: 'capture' }}>
          <div className="space-y-3">
            {dues.map((payment) => (
              <div key={payment.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-800">{typeLabel(payment)} · Contract #{payment.contractId}</p>
                    <p className="text-xs text-slate-500">Developer #{payment.developerId} · Status {payment.status}</p>
                  </div>
                  <p className="text-lg font-semibold text-[#0a66c2]">{payment.currency} {Number(payment.amount).toFixed(2)}</p>
                </div>
                <p className="mt-1 text-xs text-slate-500">Platform fee {payment.currency} {Number(payment.platformFee).toFixed(2)} · Developer receives {payment.currency} {Number(payment.developerEarnings).toFixed(2)}</p>
                <div className="mt-3">
                  <PayPalButtons
                    style={{ layout: 'horizontal', height: 40, tagline: false }}
                    forceReRender={[payment.id, payment.amount]}
                    createOrder={async () => {
                      const res: any = await createPaymentOrder(payment.id);
                      return res.orderId as string;
                    }}
                    onApprove={async (data) => {
                      try {
                        await capturePayment(payment.id, data.orderID as string);
                        setMessage('Payment released successfully. Thank you!');
                        await load();
                        onPaid?.();
                      } catch (err: any) {
                        setError(err?.message || 'Payment capture failed. Please try again.');
                      }
                    }}
                    onError={() => setError('Payment could not be completed. Please try again.')}
                  />
                </div>
              </div>
            ))}
          </div>
        </PayPalScriptProvider>
      )}

      {history.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-2 text-sm font-semibold text-slate-700">Payment history</p>
          <div className="space-y-2">
            {history.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between text-sm text-slate-600">
                <span>{typeLabel(payment)} · Contract #{payment.contractId}</span>
                <span className="inline-flex items-center gap-1 font-semibold text-green-700"><CheckCircle2 className="h-4 w-4" />{payment.currency} {Number(payment.amount).toFixed(2)} paid</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
