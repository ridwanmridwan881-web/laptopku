import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Product, Review } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Star, ShoppingBag, MessageCircle, ArrowLeft, Minus, Plus, Send, Check } from 'lucide-react';
import type { NavigateFunction } from '../App';

interface ProductDetailPageProps {
  productId: string;
  navigate: NavigateFunction;
}

export default function ProductDetailPage({ productId, navigate }: ProductDetailPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const { user, profile } = useAuth();
  const { addItem } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  async function fetchProduct() {
    const [productRes, reviewsRes] = await Promise.all([
      supabase.from('products').select('*, category:categories(*)').eq('id', productId).maybeSingle(),
      supabase.from('reviews').select('*, profile:profiles(*)').eq('product_id', productId).order('created_at', { ascending: false })
    ]);

    if (productRes.data) setProduct(productRes.data);
    if (reviewsRes.data) setReviews(reviewsRes.data);
    setLoading(false);
  }

  async function handleSubmitReview() {
    if (!user || !userComment.trim()) return;

    setSubmitting(true);
    const { error } = await supabase.from('reviews').insert({
      user_id: user.id,
      product_id: productId,
      rating: userRating,
      comment: userComment.trim()
    });

    if (!error) {
      setUserComment('');
      setUserRating(5);
      fetchProduct();
    }
    setSubmitting(false);
  }

  function handleAddToCart() {
    if (!product) return;
    addItem(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  function getWhatsAppLink() {
    if (!product) return '#';
    const message = encodeURIComponent(`Halo, saya tertarik dengan laptop:\n\n${product.name}\nHarga: Rp ${product.price.toLocaleString('id-ID')}\n\nMohon info lebih lanjut.`);
    return `https://wa.me/6281234567890?text=${message}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-slate-400 text-lg mb-4">Produk tidak ditemukan</p>
        <button
          onClick={() => navigate('home')}
          className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="relative aspect-square bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-24 h-24 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            {discount > 0 && (
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-red-500 text-white font-bold rounded-lg">
                -{discount}%
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="text-sm text-cyan-400 font-medium mb-2">{product.category?.name}</div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">{product.name}</h1>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${star <= Math.round(parseFloat(averageRating)) ? 'text-yellow-500 fill-yellow-500' : 'text-slate-600'}`}
                  />
                ))}
              </div>
              <span className="text-slate-400">{averageRating} ({reviews.length} ulasan)</span>
            </div>

            <div className="mb-6">
              <div className="text-3xl font-bold text-white">
                Rp {product.price.toLocaleString('id-ID')}
              </div>
              {product.original_price && (
                <div className="text-lg text-slate-500 line-through">
                  Rp {product.original_price.toLocaleString('id-ID')}
                </div>
              )}
            </div>

            {product.description && (
              <p className="text-slate-400 mb-6">{product.description}</p>
            )}

            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 mb-6">
              <h3 className="text-white font-semibold mb-4">Spesifikasi</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SpecItem label="Prosesor" value={product.processor} />
                <SpecItem label="RAM" value={product.ram} />
                <SpecItem label="Storage" value={product.storage} />
                {product.display && <SpecItem label="Display" value={product.display} />}
                {product.gpu && <SpecItem label="GPU" value={product.gpu} />}
                {product.battery && <SpecItem label="Baterai" value={product.battery} />}
                {product.weight && <SpecItem label="Berat" value={product.weight} />}
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="text-slate-400">Jumlah:</div>
              <div className="flex items-center gap-2 bg-slate-900 rounded-lg border border-slate-700">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-white font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-slate-400 text-sm">
                {product.stock > 0 ? `Stok: ${product.stock}` : 'Stok Habis'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all ${
                  addedToCart
                    ? 'bg-green-500 text-white'
                    : product.stock === 0
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white'
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    Ditambahkan!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    Tambah ke Keranjang
                  </>
                )}
              </button>
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Hubungi via WhatsApp
              </a>
            </div>
          </div>
        </div>

        <section className="border-t border-slate-800 pt-12">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" />
            Ulasan Pelanggan
          </h2>

          {user && (
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 mb-8">
              <h3 className="text-white font-semibold mb-4">Tulis Ulasan Anda</h3>
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setUserRating(star)}
                    className="p-1"
                  >
                    <Star className={`w-8 h-8 ${star <= userRating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-600'} transition-colors`} />
                  </button>
                ))}
              </div>
              <textarea
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="Bagikan pengalaman Anda dengan produk ini..."
                className="w-full h-24 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none mb-4"
              />
              <button
                onClick={handleSubmitReview}
                disabled={submitting || !userComment.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Mengirim...' : 'Kirim Ulasan'}
              </button>
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              Belum ada ulasan untuk produk ini.
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-medium text-white">{review.profile?.full_name || 'Pengguna'}</div>
                      <div className="text-sm text-slate-500">
                        {new Date(review.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-600'}`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-slate-300">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-800">
      <span className="text-slate-500">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );
}
