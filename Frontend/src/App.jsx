import React, { useState, useEffect } from 'react';
import { ShoppingBag, ShoppingCart, Trash2, X, CheckCircle, Store, ArrowRight, Star, Heart, SlidersHorizontal, Sparkles, ShieldCheck, Truck, Users, BarChart3, PackageCheck } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]); // Admin orders array
  const [isAdminMode, setIsAdminMode] = useState(false); // Toggle view state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [favorites, setFavorites] = useState({});

  // Fetch store catalog
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(err => { console.error("Catalog error:", err); setLoading(false); });
  }, []);

  // Fetch admin orders list whenever admin mode toggled on
  useEffect(() => {
    if (isAdminMode) {
      fetch('/api/orders')
        .then(res => res.json())
        .then(data => setOrders(data))
        .catch(err => console.error("Admin order collection error:", err));
    }
  }, [isAdminMode]);

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0).toFixed(2);
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);
  
  const categories = ['All', ...new Set(products.map(p => p.category))];
  const filteredProducts = activeCategory === 'All' ? products : products.filter(p => p.category === activeCategory);

  // Admin Calculations Metrics
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0).toFixed(2);
  const totalItemsSold = orders.reduce((sum, order) => sum + order.items.reduce((s, i) => s + i.qty, 0), 0);

  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems: cart, total: parseFloat(cartTotal) })
      });
      const data = await response.json();
      if (data.success) {
        setOrderSuccess(data.orderId);
        setCart([]);
        setIsCartOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      alert("Checkout processing failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Banner Promo */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white text-xs font-semibold py-2 px-4 text-center tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        <span>FLASH SALE: USE CODE <span className="bg-white/20 px-1.5 py-0.5 rounded font-mono">NEXUS20</span> FOR 20% OFF AT CHECKOUT!</span>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div onClick={() => setIsAdminMode(false)} className="flex items-center gap-2.5 font-black text-2xl tracking-tight text-indigo-600 group cursor-pointer">
            <div className="bg-indigo-600 text-white p-2 rounded-xl group-hover:scale-110 transition shadow-md shadow-indigo-600/20">
              <Store className="w-5 h-5" />
            </div>
            <span>NEXUS<span className="text-slate-800 font-light">LUXE</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Secrets Tab Mode Switch */}
            <button 
              onClick={() => setIsAdminMode(!isAdminMode)}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold tracking-wider transition uppercase flex items-center gap-2 ${
                isAdminMode 
                  ? 'bg-amber-500 border-amber-600 text-white shadow-sm' 
                  : 'bg-slate-900 border-slate-950 text-slate-100 hover:bg-slate-800 shadow-sm'
              }`}
            >
              <BarChart3 className="w-4 h-4"/>
              {isAdminMode ? "Exit Admin Mode" : "Admin Dashboard View"}
            </button>

            {!isAdminMode && (
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-full transition shadow-sm hover:shadow flex items-center justify-center"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm border border-white">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* --- RENDER WINDOW VIEW 1: ADMIN OPERATIONS PANEL --- */}
      {isAdminMode ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-fade-in">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Management Suite</h1>
            <p className="text-slate-500 mt-1">Review live transactions and real-time operational volume metrics.</p>
          </div>

          {/* Analytical Stat Row Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border p-6 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Gross Income Total</span>
                <h3 className="text-3xl font-black text-slate-900 mt-1">${totalRevenue}</h3>
              </div>
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl"><BarChart3 className="w-6 h-6"/></div>
            </div>
            <div className="bg-white border p-6 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total Sales Invoiced</span>
                <h3 className="text-3xl font-black text-slate-900 mt-1">{orders.length}</h3>
              </div>
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl"><PackageCheck className="w-6 h-6"/></div>
            </div>
            <div className="bg-white border p-6 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Units Dispensed</span>
                <h3 className="text-3xl font-black text-slate-900 mt-1">{totalItemsSold} items</h3>
              </div>
              <div className="p-4 bg-purple-50 text-purple-600 rounded-xl"><Users className="w-6 h-6"/></div>
            </div>
          </div>

          {/* Orders Tracking Data Ledger */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 bg-slate-50/50 border-b border-slate-200"><h3 className="font-bold text-lg text-slate-800">Transaction History Log</h3></div>
            <div className="divide-y divide-slate-100 overflow-x-auto">
              {orders.length === 0 ? (
                <div className="text-center py-20 text-slate-400">No client transactions logged on database storage yet.</div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="p-6 flex flex-col md:flex-row justify-between md:items-center gap-6 group hover:bg-slate-50/40 transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-slate-900">{order.order_id}</span>
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full uppercase tracking-wider">Settled</span>
                      </div>
                      <p className="text-xs text-slate-400">{new Date(order.created_at).toLocaleString()}</p>
                      
                      {/* Nested line item rows rendering details list */}
                      <div className="pt-2 flex flex-wrap gap-2">
                        {order.items.map((item, index) => (
                          <span key={index} className="text-xs bg-slate-100 text-slate-600 border border-slate-200/60 px-2 py-1 rounded-md font-medium">
                            {item.title} (x{item.qty})
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xl font-black text-slate-900">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* --- RENDER WINDOW VIEW 2: STANDARD LUXURY PUBLIC E-STORE storefront catalog --- */
        <>
          {/* Hero Branding Stage */}
          <section className="relative overflow-hidden bg-[#0F172A] text-white py-20 px-4 sm:px-6 lg:px-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-transparent to-transparent pointer-events-none" />
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 text-xs font-semibold rounded-full uppercase tracking-wider">New Season Arrivals</span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white">Elevate Your <br /><span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Everyday Luxury</span></h1>
                <p className="text-slate-400 text-lg max-w-md font-medium leading-relaxed">Discover expertly curated lifestyle essentials crafted with precision, premium components, and timeless design layout.</p>
                <div className="flex items-center gap-4 pt-2"><a href="#catalog" className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center gap-2">Shop Collection <ArrowRight className="w-4 h-4"/></a></div>
              </div>
              <div className="hidden lg:block relative">
                <div className="w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl absolute top-10 right-10" />
                <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800" alt="Showcase" className="w-full h-[450px] object-cover rounded-3xl shadow-2xl border border-slate-800/80 rotate-1 transform hover:rotate-0 transition duration-700" />
              </div>
            </div>
          </section>

          {/* Product Items Canvas Block */}
          <main id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {orderSuccess && (
              <div className="mb-12 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-4 text-emerald-900 shadow-sm animate-fade-in">
                <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-sm"><CheckCircle className="w-6 h-6" /></div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">Order Confirmed Successfully!</h3>
                  <p className="text-sm text-emerald-700 font-medium">Your request transaction was cleared. Order token reference is <span className="underline font-mono bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-900">{orderSuccess}</span>.</p>
                </div>
                <button onClick={() => setOrderSuccess(null)} className="ml-auto p-1 text-emerald-400 hover:text-emerald-900 transition"><X className="w-5 h-5"/></button>
              </div>
            )}

            {/* Filters Navigation bar strip row layout */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-slate-200 pb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Browse Catalog</h2>
                <p className="text-slate-500 text-sm mt-0.5">Filtering {filteredProducts.length} design items</p>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <div className="p-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 mr-2 hidden sm:block"><SlidersHorizontal className="w-4 h-4"/></div>
                {categories.map((cat) => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 text-xs font-bold rounded-xl transition uppercase tracking-wider ${activeCategory === cat ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'}`}>{cat}</button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-32"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col group relative">
                    <button onClick={() => toggleFavorite(product.id)} className="absolute top-4 right-4 z-10 p-2.5 bg-white/90 backdrop-blur-sm hover:bg-white text-slate-400 hover:text-rose-500 rounded-full shadow-sm transition border border-slate-100">
                      <Heart className={`w-4 h-4 transition ${favorites[product.id] ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
                    </button>
                    <div className="h-72 overflow-hidden bg-slate-50 relative">
                      <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out" />
                      <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest text-white border border-white/10">{product.category}</div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                        <span className="text-xs font-semibold text-slate-400 ml-1">(4.9)</span>
                      </div>
                      <h3 className="font-bold text-lg text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition duration-200">{product.title}</h3>
                      <p className="text-sm text-slate-500 mt-1.5 line-clamp-2 leading-relaxed flex-1">{product.description}</p>
                      <div className="mt-6 flex items-center justify-between pt-5 border-t border-slate-100">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price</span>
                          <span className="text-2xl font-black text-slate-900 tracking-tight">${product.price.toFixed(2)}</span>
                        </div>
                        <button onClick={() => addToCart(product)} className="px-5 py-3 bg-slate-900 text-white hover:bg-indigo-600 font-bold text-sm rounded-xl transition shadow-sm hover:shadow-md flex items-center gap-2 transform active:scale-95"><ShoppingBag className="w-4 h-4" /> Add To Bag</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>

          {/* Trust strip info block segment layout */}
          <section className="bg-white border-t border-slate-200 py-12 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-center gap-4 p-2">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Truck className="w-6 h-6"/></div>
                <div><h4 className="font-bold text-slate-800">Complimentary Shipping</h4><p className="text-xs text-slate-500 mt-0.5">Free standard ground delivery on all domestic orders</p></div>
              </div>
              <div className="flex items-center gap-4 p-2">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><ShieldCheck className="w-6 h-6"/></div>
                <div><h4 className="font-bold text-slate-800">Secured Encrypted Checkout</h4><p className="text-xs text-slate-500 mt-0.5">Tokenized banking routing pipelines processing safety</p></div>
              </div>
              <div className="flex items-center gap-4 p-2">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Sparkles className="w-6 h-6"/></div>
                <div><h4 className="font-bold text-slate-800">Satisfaction Guaranteed</h4><p className="text-xs text-slate-500 mt-0.5">Hassle-free replacement policy windows up to 30 days</p></div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* --- RENDER MODAL DRAWER ELEMENT: SLIDING OVERLAY BAG CART SHEET --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><ShoppingCart className="w-4 h-4"/></div>
                  <h2 className="text-lg font-black text-slate-800 tracking-tight">Shopping Cart ({cartCount})</h2>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-1.5 border border-slate-200 bg-white rounded-xl shadow-sm"><X className="w-4 h-4"/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-28 text-slate-400 space-y-4">
                    <div className="w-16 h-16 bg-slate-50 border rounded-2xl flex items-center justify-center mx-auto shadow-sm"><ShoppingBag className="w-6 h-6 opacity-30 text-slate-700" /></div>
                    <div><p className="font-bold text-slate-700 text-sm">Your shopping bag is empty</p><p className="text-xs text-slate-400 mt-1">Add luxury items to get started.</p></div>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-white rounded-2xl border relative group">
                      <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded-xl shrink-0 border" />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-slate-800 truncate pr-6">{item.title}</h4>
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.category}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border rounded-lg p-0.5 bg-slate-50">
                            <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 text-slate-500 hover:bg-white rounded-md text-xs">-</button>
                            <span className="w-8 text-center text-xs font-bold">{item.qty}</span>
                            <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 text-slate-500 hover:bg-white rounded-md text-xs">+</button>
                          </div>
                          <span className="font-black text-sm">${(item.price * item.qty).toFixed(2)}</span>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-600 p-1"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t bg-slate-50/80">
                  <div className="space-y-2 mb-4 text-xs font-semibold text-slate-500">
                    <div className="flex justify-between"><span>Estimated Delivery</span><span className="text-emerald-600 font-bold">FREE</span></div>
                    <div className="flex justify-between items-baseline pt-2 border-t">
                      <span className="text-sm font-bold text-slate-800">Total Bill Summary:</span>
                      <span className="text-2xl font-black text-slate-900">${cartTotal}</span>
                    </div>
                  </div>
                  <button onClick={handleCheckout} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2">Authorize Order & Checkout <ArrowRight className="w-4 h-4"/></button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
