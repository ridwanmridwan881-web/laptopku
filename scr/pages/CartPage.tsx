import { useCart } from '../context/CartContext';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import type { NavigateFunction } from '../App';

interface CartPageProps {
  navigate: NavigateFunction;
}

export default function CartPage({ navigate }: CartPageProps) {
  const { items, updateQuantity, removeItem, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-slate-600" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Keranjang Kosong</h2>
        <p className="text-slate-400 mb-6">Belum ada produk di keranjang Anda</p>
        <button
          onClick={() => navigate('home')}
          className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-lg transition-colors"
        >
          Mulai Belanja
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Keranjang Belanja</h1>
          <button
            onClick={clearCart}
            className="text-slate-400 hover:text-red-400 text-sm transition-colors"
          >
            Kosongkan Keranjang
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div
                key={item.product.id}
                className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex gap-4"
              >
                <div
                  className="w-24 h-24 bg-slate-800 rounded-lg flex-shrink-0 cursor-pointer overflow-hidden"
                  onClick={() => navigate('product', item.product.id)}
                >
                  {item.product.image_url ? (
                    <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3
                    className="font-semibold text-white mb-1 cursor-pointer hover:text-cyan-400 transition-colors"
                    onClick={() => navigate('product', item.product.id)}
                  >
                    {item.product.name}
                  </h3>
                  <p className="text-sm text-slate-400 mb-2">{item.product.processor} | {item.product.ram}</p>
                  <div className="text-lg font-bold text-white">
                    Rp {item.product.price.toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2 bg-slate-800 rounded-lg border border-slate-700">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-2 text-slate-400 hover:text-white transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-white font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-2 text-slate-400 hover:text-white transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-white mb-4">Ringkasan Pesanan</h3>

              <div className="space-y-3 pb-4 border-b border-slate-800 mb-4">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} item)</span>
                  <span>Rp {total.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Ongkos Kirim</span>
                  <span className="text-green-400">Gratis</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold text-white mb-6">
                <span>Total</span>
                <span>Rp {total.toLocaleString('id-ID')}</span>
              </div>

              <button
                onClick={() => navigate('checkout')}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all"
              >
                Lanjut ke Pembayaran
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
