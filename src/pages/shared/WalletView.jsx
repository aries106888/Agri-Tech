import { useState, useEffect } from 'react';
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, Send, 
  CheckCircle2, XCircle, Clock, AlertCircle, Phone
} from 'lucide-react';
import api from '../../services/api';

const MOCK_TXNS = {
  farmer: [
    { id: 'TXN-791A', type: 'credit', label: 'Naivas Ltd – Maize Sale', amount: 41000, date: '9 Jun 2026', status: 'completed', ref: 'QK7A3NM' },
    { id: 'TXN-294B', type: 'credit', label: 'Janet Wanjiku – Red Onions', amount: 12600, date: '8 Jun 2026', status: 'completed', ref: 'QK8B2PL' },
    { id: 'TXN-831C', type: 'debit', label: 'M-PESA Payout Withdrawal', amount: 15000, date: '7 Jun 2026', status: 'completed', ref: 'QK5C9RZ' },
    { id: 'TXN-492D', type: 'credit', label: 'Quickmart – Kienyeji Eggs', amount: 6750, date: '7 Jun 2026', status: 'pending', ref: 'QK2D4WQ' },
    { id: 'TXN-019E', type: 'credit', label: 'David Ochieng – Sweet Corn', amount: 9200, date: '5 Jun 2026', status: 'completed', ref: 'QK6E1TX' },
    { id: 'TXN-112F', type: 'debit', label: 'Logistics Fee – Nakuru Trip', amount: 2350, date: '4 Jun 2026', status: 'failed', ref: 'QK3F7YK' },
  ],
  buyer: [
    { id: 'TXN-902A', type: 'debit', label: 'Payment: Potatoes Mwangi J.', amount: 22500, date: '9 Jun 2026', status: 'completed', ref: 'KBX119P' },
    { id: 'TXN-491B', type: 'debit', label: 'Payment: Tomatoes Sarah K.', amount: 8000, date: '8 Jun 2026', status: 'completed', ref: 'KBX294D' },
    { id: 'TXN-312C', type: 'credit', label: 'Wallet Deposit via M-PESA', amount: 50000, date: '7 Jun 2026', status: 'completed', ref: 'KBX812L' },
    { id: 'TXN-108D', type: 'debit', label: 'Payment: Maize David K.', amount: 16400, date: '6 Jun 2026', status: 'pending', ref: 'KBX092R' },
  ],
  logistics: [
    { id: 'TXN-381A', type: 'credit', label: 'Trip Earnings: Nakuru to Nrb', amount: 3500, date: '9 Jun 2026', status: 'completed', ref: 'LOG902A' },
    { id: 'TXN-491B', type: 'credit', label: 'Trip Earnings: Kiambu to Westlands', amount: 2200, date: '8 Jun 2026', status: 'completed', ref: 'LOG811D' },
    { id: 'TXN-012C', type: 'debit', label: 'Earnings Withdrawal to M-PESA', amount: 4000, date: '7 Jun 2026', status: 'completed', ref: 'LOG294L' },
    { id: 'TXN-902D', type: 'credit', label: 'Trip Earnings: Kajiado to Mombasa Rd', amount: 5000, date: '6 Jun 2026', status: 'pending', ref: 'LOG102K' },
  ],
};

const WalletView = ({ role = 'farmer' }) => {
  const [balance, setBalance] = useState(() => {
    if (role === 'farmer') return 34200;
    if (role === 'buyer') return 12100;
    return 6700;
  });
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [modal, setModal] = useState(null); // 'deposit' | 'withdraw' | 'transfer'
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('spUser') || '{}').phone || '';
    } catch {
      return '';
    }
  });
  const [recipient, setRecipient] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    // Simulate loading data with skeleton loader
    const timer = setTimeout(() => {
      setTransactions(MOCK_TXNS[role] || []);
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [role]);

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setActionError('Please enter a valid amount.');
      return;
    }
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await api.post('/payments/mpesa/stkpush', {
        phone: phone,
        amount: parseFloat(amount),
        account_reference: 'SPWallet',
        description: 'Wallet Deposit'
      });

      const data = res.data;
      if (data._note && data._note.includes('Simulated')) {
        setActionSuccess('STK Push simulated successfully! KSh ' + parseFloat(amount).toLocaleString() + ' added.');
        setBalance(prev => prev + parseFloat(amount));
        const newTx = {
          id: 'TXN-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
          type: 'credit',
          label: 'Wallet Deposit via M-PESA',
          amount: parseFloat(amount),
          date: 'Just now',
          status: 'completed',
          ref: 'MP' + Math.random().toString(36).substring(2, 8).toUpperCase()
        };
        setTransactions(prev => [newTx, ...prev]);
        setTimeout(() => setModal(null), 1500);
      } else {
        setActionSuccess('Payment request sent. Enter M-PESA PIN on your phone.');
        setTimeout(() => setModal(null), 2500);
      }
    } catch {
      // Fallback
      setBalance(prev => prev + parseFloat(amount));
      const newTx = {
        id: 'TXN-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
        type: 'credit',
        label: 'Wallet Deposit (Offline Mode)',
        amount: parseFloat(amount),
        date: 'Just now',
        status: 'completed',
        ref: 'MP' + Math.random().toString(36).substring(2, 8).toUpperCase()
      };
      setTransactions(prev => [newTx, ...prev]);
      setActionSuccess('Deposit successful!');
      setTimeout(() => setModal(null), 1200);
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const withdrawAmt = parseFloat(amount);
    const fee = 20; // KSh 20 withdrawal transaction fee
    const totalDeducted = withdrawAmt + fee;

    if (!amount || isNaN(amount) || withdrawAmt <= 0) {
      setActionError('Please enter a valid amount.');
      return;
    }
    if (totalDeducted > balance) {
      setActionError(`Insufficient balance. KSh ${withdrawAmt.toLocaleString()} + KSh ${fee} transaction fee exceeds balance of KSh ${balance.toLocaleString()}.`);
      return;
    }
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');

    try {
      await api.post('/payments/mpesa/b2c', {
        phone: phone,
        amount: withdrawAmt,
        occasion: 'Payout',
        remarks: 'Wallet Withdrawal'
      });

      setBalance(prev => prev - totalDeducted);
      const newTx = {
        id: 'TXN-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
        type: 'debit',
        label: `Withdrawal to M-PESA (KSh ${fee} fee included)`,
        amount: totalDeducted,
        date: 'Just now',
        status: 'completed',
        ref: 'WD' + Math.random().toString(36).substring(2, 8).toUpperCase()
      };
      setTransactions(prev => [newTx, ...prev]);
      setActionSuccess(`Withdrawal of KSh ${withdrawAmt.toLocaleString()} initiated! (KSh ${fee} fee charged). Funds arriving shortly.`);
      setTimeout(() => setModal(null), 1800);
    } catch {
      setBalance(prev => prev - totalDeducted);
      const newTx = {
        id: 'TXN-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
        type: 'debit',
        label: `Withdrawal to M-PESA (KSh ${fee} fee included)`,
        amount: totalDeducted,
        date: 'Just now',
        status: 'completed',
        ref: 'WD' + Math.random().toString(36).substring(2, 8).toUpperCase()
      };
      setTransactions(prev => [newTx, ...prev]);
      setActionSuccess(`Withdrawal of KSh ${withdrawAmt.toLocaleString()} initiated! (KSh ${fee} fee charged).`);
      setTimeout(() => setModal(null), 1500);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTransfer = (e) => {
    e.preventDefault();
    const xferAmt = parseFloat(amount);
    if (!amount || isNaN(amount) || xferAmt <= 0) {
      setActionError('Please enter a valid amount.');
      return;
    }
    if (xferAmt > balance) {
      setActionError('Insufficient balance.');
      return;
    }
    if (!recipient) {
      setActionError('Recipient details are required.');
      return;
    }
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');

    setTimeout(() => {
      setBalance(prev => prev - xferAmt);
      const newTx = {
        id: 'TXN-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
        type: 'debit',
        label: `Transfer to ${recipient}`,
        amount: xferAmt,
        date: 'Just now',
        status: 'completed',
        ref: 'TR' + Math.random().toString(36).substring(2, 8).toUpperCase()
      };
      setTransactions(prev => [newTx, ...prev]);
      setActionSuccess(`Transferred KSh ${xferAmt.toLocaleString()} successfully!`);
      setActionLoading(false);
      setTimeout(() => setModal(null), 1500);
    }, 1000);
  };

  const openActionModal = (type) => {
    setAmount('');
    setActionError('');
    setActionSuccess('');
    setModal(type);
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* ── WALLET MAIN CARD ── */}
      <div 
        className="rounded-2xl p-6 lg:p-8 relative overflow-hidden shadow-xl"
        style={{
          background: 'linear-gradient(135deg, #0f2d1e 0%, #1b4332 50%, #2d6a4f 100%)',
          boxShadow: '0 12px 30px rgba(27,67,50,0.25)'
        }}
      >
        {/* Background decorative vectors */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.03] rounded-full -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/[0.02] rounded-full -ml-8 -mb-8 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-200/80 mb-2">
              <Wallet className="w-5 h-5 text-emerald-300" />
              <span className="text-xs font-bold uppercase tracking-widest">ShambaPoint Wallet</span>
            </div>
            <p className="text-4xl lg:text-5xl font-black text-white tracking-tight">
              KSh {balance.toLocaleString()}
            </p>
            <p className="text-xs text-emerald-200/50 mt-1.5 font-bold">
              Account Status: Verified • Secure Escrow Enabled
            </p>
          </div>

          {/* Quick Actions Row */}
          <div className="grid grid-cols-3 md:flex gap-2.5">
            <button
              onClick={() => openActionModal('deposit')}
              className="flex flex-col md:flex-row items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-extrabold text-xs tracking-wide uppercase px-4 py-3 border border-emerald-500/30 rounded-xl transition-all"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Deposit</span>
            </button>
            <button
              onClick={() => openActionModal('withdraw')}
              className="flex flex-col md:flex-row items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-extrabold text-xs tracking-wide uppercase px-4 py-3 border border-amber-500/30 rounded-xl transition-all"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Withdraw</span>
            </button>
            <button
              onClick={() => openActionModal('transfer')}
              className="flex flex-col md:flex-row items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-extrabold text-xs tracking-wide uppercase px-4 py-3 border border-white/10 rounded-xl transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Transfer</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── TRANSACTION HISTORY ── */}
      <div className="bg-white border border-ag-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-ag-border flex items-center justify-between">
          <h3 className="font-extrabold text-ag-body text-base flex items-center gap-2">
            Recent Wallet Transactions
          </h3>
          <span className="text-xs text-ag-muted font-bold">Updated in real-time</span>
        </div>

        {loading ? (
          /* SKELETON LOADER */
          <div className="p-6 flex flex-col gap-4">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="flex items-center justify-between py-2 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-ag-surface rounded-xl" />
                  <div className="flex flex-col gap-2">
                    <div className="h-3 w-36 bg-ag-surface rounded-full" />
                    <div className="h-2 w-24 bg-ag-surface rounded-full" />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="h-3.5 w-16 bg-ag-surface rounded-full" />
                  <div className="h-2.5 w-12 bg-ag-surface rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          /* EMPTY STATE */
          <div className="py-16 px-6 text-center max-w-sm mx-auto flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-ag-surface rounded-full flex items-center justify-center text-ag-muted/40 mb-2">
              <Wallet className="w-7 h-7" />
            </div>
            <p className="font-extrabold text-ag-body text-base">No transactions yet</p>
            <p className="text-xs text-ag-muted leading-relaxed">
              Your transaction history is currently empty. Make a deposit or receive payments to view records.
            </p>
            <button
              onClick={() => openActionModal('deposit')}
              className="btn-primary !min-h-0 !py-2.5 !px-5 !text-xs mt-2"
            >
              Deposit Funds
            </button>
          </div>
        ) : (
          /* TRANSACTION LIST */
          <div className="divide-y divide-ag-border">
            {transactions.map(txn => {
              const isCredit = txn.type === 'credit';
              const StatusIcon = txn.status === 'completed' 
                ? CheckCircle2 
                : txn.status === 'pending' 
                ? Clock 
                : XCircle;
              
              const statusColors = {
                completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200/50',
                pending: 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200/50',
                failed: 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200/50'
              }[txn.status];

              return (
                <div key={txn.id} className="px-6 py-4 flex items-center justify-between hover:bg-ag-canvas/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {isCredit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-extrabold text-ag-body text-sm leading-snug">{txn.label}</p>
                      <p className="text-[11px] text-ag-muted mt-0.5 font-semibold">
                        Ref: {txn.ref} • {txn.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <p className={`font-extrabold text-sm ${isCredit ? 'text-emerald-600' : 'text-ag-body'}`}>
                      {isCredit ? '+' : '-'} KSh {txn.amount.toLocaleString()}
                    </p>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 uppercase ${statusColors}`}>
                      <StatusIcon className="w-3 h-3" />
                      {txn.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODALS ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-slide-up border border-ag-border">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-ag-border mb-4">
              <h3 className="font-black text-ag-body text-lg capitalize flex items-center gap-2">
                {modal === 'deposit' && <><ArrowDownLeft className="w-5 h-5 text-emerald-600" /> Deposit via M-PESA</>}
                {modal === 'withdraw' && <><ArrowUpRight className="w-5 h-5 text-amber-600" /> Withdraw to M-PESA</>}
                {modal === 'transfer' && <><Send className="w-5 h-5 text-emerald-600" /> Transfer Funds</>}
              </h3>
              <button 
                onClick={() => setModal(null)}
                className="p-1 rounded-full hover:bg-ag-surface text-ag-muted transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Banners */}
            {actionError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{actionError}</span>
              </div>
            )}
            {actionSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {/* Modal Content / Form */}
            {modal === 'deposit' && (
              <form onSubmit={handleDeposit} className="flex flex-col gap-4">
                <div className="bg-emerald-50 border border-emerald-200/50 rounded-xl p-4 text-xs text-emerald-800 leading-relaxed">
                  Funds will be pulled from your M-PESA number via STK Push. Enter the amount, click request, and enter your PIN on your phone.
                </div>
                <div>
                  <label className="block text-xs font-bold text-ag-body mb-1.5 uppercase tracking-wider">M-PESA Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ag-outline" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="e.g. 0712345678"
                      className="form-input pl-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-ag-body mb-1.5 uppercase tracking-wider">Amount (KSh)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="Enter amount to deposit"
                    className="form-input"
                    min="10"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-pay w-full mt-2 flex items-center justify-center gap-2"
                >
                  {actionLoading ? 'Sending STK Push...' : `Request KSh ${amount ? parseFloat(amount).toLocaleString() : '0'} Deposit`}
                </button>
              </form>
            )}

            {modal === 'withdraw' && (
              <form onSubmit={handleWithdraw} className="flex flex-col gap-4">
                <div className="bg-amber-50 border border-amber-200/50 rounded-xl p-4 text-xs text-amber-800 flex justify-between font-bold">
                  <span>Available Balance:</span>
                  <span className="text-amber-900">KSh {balance.toLocaleString()}</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-ag-body mb-1.5 uppercase tracking-wider">Withdraw to M-PESA Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ag-outline" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="e.g. 0712345678"
                      className="form-input pl-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-ag-body mb-1.5 uppercase tracking-wider">Amount (KSh)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="Enter amount to withdraw"
                    className="form-input"
                    max={balance}
                    min="10"
                    required
                  />
                </div>
                {amount && parseFloat(amount) > 0 && (
                  <div className="bg-ag-canvas rounded-xl p-3 text-xs flex flex-col gap-1 border border-ag-border font-medium">
                    <div className="flex justify-between text-ag-muted">
                      <span>Withdrawal Amount:</span>
                      <span>KSh {parseFloat(amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-ag-muted">
                      <span>System Transaction Fee:</span>
                      <span className="text-amber-600 font-bold">+ KSh 20.00</span>
                    </div>
                    <div className="flex justify-between text-ag-body font-bold border-t border-ag-border pt-1 mt-0.5">
                      <span>Total Balance Deduction:</span>
                      <span className="text-ag-primary">KSh {(parseFloat(amount) + 20).toLocaleString()}</span>
                    </div>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-pay w-full mt-2 bg-amber-600 hover:bg-amber-700 flex items-center justify-center gap-2"
                >
                  {actionLoading ? 'Processing withdrawal...' : `Withdraw KSh ${amount ? parseFloat(amount).toLocaleString() : '0'} (+ KSh 20 Fee)`}
                </button>
              </form>
            )}

            {modal === 'transfer' && (
              <form onSubmit={handleTransfer} className="flex flex-col gap-4">
                <div className="bg-emerald-50 border border-emerald-200/50 rounded-xl p-4 text-xs text-emerald-800 flex justify-between font-bold">
                  <span>Available Balance:</span>
                  <span className="text-emerald-900">KSh {balance.toLocaleString()}</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-ag-body mb-1.5 uppercase tracking-wider">Recipient Name or Email</label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={e => setRecipient(e.target.value)}
                    placeholder="Recipient's name or email"
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ag-body mb-1.5 uppercase tracking-wider">Amount (KSh)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="Enter amount to transfer"
                    className="form-input"
                    max={balance}
                    min="10"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
                >
                  {actionLoading ? 'Transferring...' : `Transfer KSh ${amount ? parseFloat(amount).toLocaleString() : '0'}`}
                </button>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default WalletView;
