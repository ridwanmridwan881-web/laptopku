import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CreditCard, Truck, CheckCircle, AlertCircle, MapPin, Phone, MessageSquare } from 'lucide-react';
import type { NavigateFunction } from '../App';

interface CheckoutPageProps {
  navigate: NavigateFunction;
}

export default function CheckoutPage({ navigate }: CheckoutPageProps) {
  const { user, profile } = useAuth();
  const { items, total, clearCart } = useCart();
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!address.trim()) {
      setError('Alamat pengiriman harus diisi');
      return;
    }

    if (!phone.trim()) {
      setError('Nomor telepon harus diisi');
      return;
    }

    setLoading(true);

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user!.id,
          total_amount: total,
          shipping_address: address,
          phone,
          notes,
          payment_method: paymentMethod,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      for (const item of items) {
        await supabase.rpc('decrement_stock', {
          product_id: item.product.id,
          qty: item.quantity
        });
      }

      clearCart();
      setSuccess(true);
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      console.error(err);
    }

    setLoading(false);
  }

  if (items.length === 0 && !success) {
    navigate('cart');
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Pesanan Berhasil!</h1>
          <p className="text-slate-400 mb-8">
            Terima kasih atas pesanan Anda. Kami akan segera memproses pesanan dan menghubungi Anda untuk konfirmasi pembayaran.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('orders')}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-lg transition-colors"
            >
              Lihat Pesanan
            </button>
            <button
              onClick={() => navigate('home')}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
            >
              Kembali Berbelanja
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-white mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-500" />
                Alamat Pengiriman
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Nomor Telepon</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Alamat Lengkap</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Jl. Contoh No. 123, Kelurahan, Kecamatan, Kota, Kode Pos"
                      required
                      rows={3}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Catatan (Opsional)</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Instruksi khusus untuk pengiriman..."
                      rows={2}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-cyan-500" />
                Metode Pembayaran
              </h2>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 bg-slate-800 rounded-lg border-2 cursor-pointer transition-colors border-cyan-500">
                  <input
                    type="radio"
                    name="payment"
                    value="transfer"
                    checked={paymentMethod === 'transfer'}
                    onChange={() => setPaymentMethod('transfer')}
                    className="w-4 h-4 text-cyan-500"
                  />
                  <div>
                    <div className="font-medium text-white">Transfer Bank</div>
                    <div className="text-sm text-slate-400">BCA, Mandiri, BNI, BRI</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-slate-800 rounded-lg border-2 cursor-pointer transition-colors border-slate-700 hover:border-slate-600">
                  <input
                    type="radio"
                    name="payment"
                    value="ewallet"
                    checked={paymentMethod === 'ewallet'}
                    onChange={() => setPaymentMethod('ewallet')}
                    className="w-4 h-4 text-cyan-500"
                  />
                  <div>
                    <div className="font-medium text-white">E-Wallet</div>
                    <div className="text-sm text-slate-400">GoPay, OVO, DANA, ShopeePay</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-slate-800 rounded-lg border-2 cursor-pointer transition-colors border-slate-700 hover:border-slate-600">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="w-4 h-4 text-cyan-500"
                  />
                  <div>
                    <div className="font-medium text-white">Bayar di Tempat (COD)</div>
                    <div className="text-sm text-slate-400">Bayar saat barang diterima</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-cyan-500" />
                Ringkasan Pesanan
              </h2>

              <div className="space-y-3 mb-6 max-h-64 overflow-auto">
                {items.map(item => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-slate-800 rounded-lg flex-shrink-0 overflow-hidden">
                      {item.product.image_url ? (
                        <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-white line-clamp-1">{item.product.name}</h4>
                      <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                      <p className="text-sm text-cyan-400 font-medium">
                        Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-800">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>Rp {total.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Ongkos Kirim</span>
                  <span className="text-green-400">Gratis</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-slate-800 mt-2">
                  <span>Total</span>
                  <span>Rp {total.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full mt-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold rounded-xl transition-all"
              >
                {loading ? 'Memproses...' : 'Konfirmasi Pesanan'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
