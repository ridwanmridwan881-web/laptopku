import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Product, Category } from '../types';
import { Star, ShoppingBag, Zap, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import type { NavigateFunction } from '../App';

interface HomePageProps {
  navigate: NavigateFunction;
}

export default function HomePage({ navigate }: HomePageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const { addItem } = useCart();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [productsRes, categoriesRes] = await Promise.all([
      supabase.from('products').select('*, category:categories(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('created_at')
    ]);

    if (productsRes.data) setProducts(productsRes.data);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    setLoading(false);
  }

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category?.slug === activeCategory);

  const featuredProducts = products.filter(p => p.is_featured).slice(0, 4);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 py-20 lg:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBtLTEgMGExIDEgMCAxIDAgMiAwYTEgMCAwIDEtMiAwIiBmaWxsPSJyZ2JhKDI1MCwyNTAsMjUwLDAuMDUpIi8+PC9nPjwvc3ZnPg==')] opacity-40" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Promo Spesial Bulan Ini
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Temukan Laptop
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"> Terbaik </span>
              untuk Anda
            </h1>
            <p className="text-lg text-slate-400 mb-8">
              Koleksi lengkap laptop gaming, kerja, dan budget dengan harga terjangkau dan kualitas terjamin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  const el = document.getElementById('products');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-cyan-500/25"
              >
                Lihat Koleksi
              </button>
              <button
                onClick={() => setActiveCategory('gaming')}
                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-all"
              >
                Laptop Gaming
              </button>
            </div>
          </div>
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section className="py-16 bg-slate-900 border-y border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white mb-8">Produk Unggulan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <FeaturedProductCard
                  key={product.id}
                  product={product}
                  onNavigate={() => navigate('product', product.id)}
                  onAddToCart={() => addItem(product)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="products" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h2 className="text-2xl font-bold text-white">Katalog Laptop</h2>
            <div className="flex flex-wrap gap-2">
              <CategoryButton active={activeCategory === 'all'} onClick={() => setActiveCategory('all')}>
                Semua
              </CategoryButton>
              {categories.map(cat => (
                <CategoryButton
                  key={cat.id}
                  active={activeCategory === cat.slug}
                  onClick={() => setActiveCategory(cat.slug)}
                >
                  {cat.name}
                </CategoryButton>
              ))}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-400 text-lg">Belum ada produk di kategori ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onNavigate={() => navigate('product', product.id)}
                  onAddToCart={() => addItem(product)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-14 h-14 bg-cyan-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-7 h-7 text-cyan-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Pengiriman Cepat</h3>
              <p className="text-slate-400">Pengiriman ke seluruh Indonesia dalam 1-3 hari kerja</p>
            </div>
            <div className="p-6">
              <div className="w-14 h-14 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-7 h-7 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Garansi Resmi</h3>
              <p className="text-slate-400">Semua produk bergaransi resmi 1-2 tahun</p>
            </div>
            <div className="p-6">
              <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-7 h-7 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Pembayaran Aman</h3>
              <p className="text-slate-400">Berbagai metode pembayaran tersedia</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CategoryButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-cyan-500 text-white'
          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

function ProductCard({ product, onNavigate, onAddToCart }: { product: Product; onNavigate: () => void; onAddToCart: () => void }) {
  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

  return (
    <div className="group bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-cyan-500/50 transition-all hover:shadow-xl hover:shadow-cyan-500/10">
      <div className="relative aspect-[4/3] bg-slate-800 overflow-hidden cursor-pointer" onClick={onNavigate}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <LaptopIcon />
          </div>
        )}
        {discount > 0 && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
            -{discount}%
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
            <span className="px-4 py-2 bg-slate-800 text-slate-400 rounded-lg font-medium">Stok Habis</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="text-xs text-cyan-400 font-medium mb-1">{product.category?.name || 'Laptop'}</div>
        <h3
          className="text-white font-semibold mb-2 cursor-pointer hover:text-cyan-400 transition-colors line-clamp-2"
          onClick={onNavigate}
        >
          {product.name}
        </h3>
        <div className="space-y-1 mb-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">CPU:</span>
            <span>{product.processor}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">RAM:</span>
            <span>{product.ram}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Storage:</span>
            <span>{product.storage}</span>
          </div>
        </div>
        <div className="flex items-end justify-between gap-2">
          <div>
            <div className="text-lg font-bold text-white">
              Rp {product.price.toLocaleString('id-ID')}
            </div>
            {product.original_price && (
              <div className="text-xs text-slate-500 line-through">
                Rp {product.original_price.toLocaleString('id-ID')}
              </div>
            )}
          </div>
          <button
            onClick={onAddToCart}
            disabled={product.stock === 0}
            className="p-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function FeaturedProductCard({ product, onNavigate, onAddToCart }: { product: Product; onNavigate: () => void; onAddToCart: () => void }) {
  return (
    <div className="group bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700 hover:border-cyan-500/50 transition-all cursor-pointer" onClick={onNavigate}>
      <div className="relative aspect-[4/3] bg-slate-800">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <LaptopIcon />
          </div>
        )}
      </div>
      <div className="p-3">
        <h4 className="text-white text-sm font-medium line-clamp-1 mb-1">{product.name}</h4>
        <div className="flex items-center justify-between">
          <span className="text-cyan-400 font-bold text-sm">
            Rp {product.price.toLocaleString('id-ID')}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(); }}
            className="p-1.5 bg-cyan-500 hover:bg-cyan-400 text-white rounded-md transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function LaptopIcon() {
  return (
    <svg className="w-16 h-16 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
