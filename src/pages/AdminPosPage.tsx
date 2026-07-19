import { useEffect, useMemo, useState } from 'react';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import type { Product } from '../types';
import { formatPrice, PRODUCT_PLACEHOLDER_IMAGE } from '../data/products';
import { getProductImage } from '../data/images';
import { syncPublishedProductsFromApi } from '../services/productService';
import {
  createPosSale,
  fetchOrders,
  type PaymentMethod,
  type PosOrder,
  voidOrder,
} from '../services/orderService';

interface CartLine {
  productId: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  stock: number;
}

const PAYMENTS: { id: PaymentMethod; label: string }[] = [
  { id: 'cash', label: 'Cash' },
  { id: 'card', label: 'Card' },
  { id: 'mobile_money', label: 'Mobile Money' },
  { id: 'other', label: 'Other' },
];

function paymentLabel(method: PaymentMethod) {
  return PAYMENTS.find((p) => p.id === method)?.label ?? method;
}

export function AdminPosPage() {
  const [tab, setTab] = useState<'sell' | 'history'>('sell');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<PosOrder[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lastSale, setLastSale] = useState<PosOrder | null>(null);

  const loadProducts = async () => {
    const list = await syncPublishedProductsFromApi();
    setProducts(list);
  };

  const loadOrders = async () => {
    setOrders(await fetchOrders(80));
  };

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([loadProducts(), loadOrders()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load POS data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const sellable = useMemo(
    () =>
      products.filter(
        (p) => !p.comingSoon && (search.trim() === '' || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()))
      ),
    [products, search]
  );

  const cartTotal = cart.reduce((sum, line) => sum + line.price * line.quantity, 0);

  const addToCart = (product: Product) => {
    setError('');
    setSuccess('');
    if (product.comingSoon) return;
    if ((product.stock ?? 0) <= 0) {
      setError(`"${product.name}" is out of stock.`);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === product.id);
      if (existing) {
        if (existing.quantity >= (product.stock ?? 0)) {
          setError(`Only ${product.stock} left for "${product.name}".`);
          return prev;
        }
        return prev.map((l) =>
          l.productId === product.id ? { ...l, quantity: l.quantity + 1, stock: product.stock ?? 0 } : l
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          quantity: 1,
          stock: product.stock ?? 0,
        },
      ];
    });
  };

  const setQty = (productId: string, quantity: number) => {
    setCart((prev) =>
      prev
        .map((l) => {
          if (l.productId !== productId) return l;
          const next = Math.max(0, Math.min(l.stock, Math.floor(quantity)));
          return { ...l, quantity: next };
        })
        .filter((l) => l.quantity > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setNotes('');
    setPaymentMethod('cash');
  };

  const completeSale = async () => {
    if (cart.length === 0) {
      setError('Add products to the cart first.');
      return;
    }
    setCheckingOut(true);
    setError('');
    setSuccess('');
    try {
      const sale = await createPosSale({
        items: cart.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        paymentMethod,
        customerName: customerName.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setLastSale(sale);
      setSuccess(`Sale ${sale.orderNumber} completed — ${formatPrice(sale.total)}`);
      clearCart();
      await Promise.all([loadProducts(), loadOrders()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not complete sale');
    } finally {
      setCheckingOut(false);
    }
  };

  const handleVoid = async (order: PosOrder) => {
    if (!window.confirm(`Void sale ${order.orderNumber}? Stock will be restored.`)) return;
    setError('');
    try {
      await voidOrder(order.id);
      await Promise.all([loadProducts(), loadOrders()]);
      setSuccess(`Voided ${order.orderNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not void sale');
    }
  };

  const printReceipt = (order: PosOrder) => {
    const win = window.open('', '_blank', 'width=360,height=640');
    if (!win) return;
    const lines = order.items
      .map(
        (i) =>
          `<tr><td>${i.name} × ${i.quantity}</td><td style="text-align:right">${formatPrice(i.price * i.quantity)}</td></tr>`
      )
      .join('');
    win.document.write(`<!doctype html><html><head><title>${order.orderNumber}</title>
      <style>
        body{font-family:system-ui,sans-serif;padding:16px;color:#111}
        h1{font-size:16px;margin:0 0 4px}
        p{margin:2px 0;font-size:12px;color:#444}
        table{width:100%;border-collapse:collapse;margin-top:12px;font-size:13px}
        td{padding:4px 0;border-bottom:1px solid #eee}
        .total{font-weight:700;font-size:15px;margin-top:12px}
      </style></head><body>
      <h1>The Precious Creations</h1>
      <p>Receipt ${order.orderNumber}</p>
      <p>${new Date(order.createdAt).toLocaleString()}</p>
      <p>Payment: ${paymentLabel(order.paymentMethod)}</p>
      ${order.customerName ? `<p>Customer: ${order.customerName}</p>` : ''}
      <table>${lines}</table>
      <p class="total">Total: ${formatPrice(order.total)}</p>
      <p style="margin-top:16px">Thank you!</p>
      <script>window.print()</script>
      </body></html>`);
    win.document.close();
  };

  return (
    <div className="db-root">
      <AdminSidebar active="pos" />
      <main className="db-main">
        <header className="db-topbar">
          <div className="db-topbar-left">
            <h1 className="db-topbar-title">Point of Sale</h1>
            <p className="db-topbar-date">In-store sales with live stock updates</p>
          </div>
          <div className="db-actions" style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className={`btn btn-sm ${tab === 'sell' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setTab('sell')}
            >
              Sell
            </button>
            <button
              type="button"
              className={`btn btn-sm ${tab === 'history' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setTab('history')}
            >
              Sales history
            </button>
            <button type="button" className="btn btn-sm btn-outline" onClick={() => void refresh()} disabled={loading}>
              Refresh
            </button>
          </div>
        </header>

        <div className="db-content">
          {error && (
            <div className="auth-error" role="alert" style={{ marginBottom: 16 }}>
              <span>⚠️</span> {error}
            </div>
          )}
          {success && (
            <div className="pos-success" role="status">
              {success}
              {lastSale && (
                <button type="button" className="btn btn-sm btn-outline" onClick={() => printReceipt(lastSale)}>
                  Print receipt
                </button>
              )}
            </div>
          )}

          {tab === 'sell' ? (
            <div className="pos-layout">
              <section className="db-widget pos-catalog">
                <div className="db-widget-header">
                  <h2 className="db-widget-title">Products</h2>
                  <span className="db-trend-sub">{sellable.length} available</span>
                </div>
                <input
                  className="auth-input"
                  type="search"
                  placeholder="Search by name or category…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ marginBottom: 14 }}
                />
                {loading ? (
                  <p className="db-welcome-sub">Loading catalog…</p>
                ) : (
                  <div className="pos-product-grid">
                    {sellable.map((p) => {
                      const out = (p.stock ?? 0) <= 0;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          className={`pos-product-card${out ? ' out' : ''}`}
                          onClick={() => addToCart(p)}
                          disabled={out}
                        >
                          <img
                            src={p.placeholder || !p.imageUrl ? PRODUCT_PLACEHOLDER_IMAGE : getProductImage(p)}
                            alt=""
                            className="pos-product-img"
                          />
                          <span className="pos-product-cat">{p.category}</span>
                          <span className="pos-product-name">{p.name}</span>
                          <span className="pos-product-meta">
                            {formatPrice(p.price)} · {out ? 'Out of stock' : `${p.stock ?? 0} left`}
                          </span>
                        </button>
                      );
                    })}
                    {!sellable.length && (
                      <p className="db-welcome-sub">No matching products. Publish items or clear search.</p>
                    )}
                  </div>
                )}
              </section>

              <section className="db-widget pos-cart">
                <div className="db-widget-header">
                  <h2 className="db-widget-title">Cart</h2>
                  {cart.length > 0 && (
                    <button type="button" className="db-widget-action" onClick={clearCart}>
                      Clear
                    </button>
                  )}
                </div>

                {cart.length === 0 ? (
                  <p className="db-welcome-sub">Tap products to add them.</p>
                ) : (
                  <div className="pos-cart-lines">
                    {cart.map((line) => (
                      <div key={line.productId} className="pos-cart-line">
                        <div>
                          <div className="pos-cart-name">{line.name}</div>
                          <div className="pos-cart-price">{formatPrice(line.price)} each</div>
                        </div>
                        <div className="pos-qty">
                          <button type="button" onClick={() => setQty(line.productId, line.quantity - 1)}>−</button>
                          <input
                            type="number"
                            min={1}
                            max={line.stock}
                            value={line.quantity}
                            onChange={(e) => setQty(line.productId, Number(e.target.value))}
                          />
                          <button type="button" onClick={() => setQty(line.productId, line.quantity + 1)}>+</button>
                        </div>
                        <div className="pos-line-total">{formatPrice(line.price * line.quantity)}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pos-checkout">
                  <label className="auth-label">
                    Customer name (optional)
                    <input
                      className="auth-input"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Walk-in customer"
                    />
                  </label>
                  <label className="auth-label">
                    Notes (optional)
                    <input
                      className="auth-input"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Gift wrap, discount note…"
                    />
                  </label>
                  <div className="pos-pay-row">
                    {PAYMENTS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className={`pos-pay-btn${paymentMethod === p.id ? ' active' : ''}`}
                        onClick={() => setPaymentMethod(p.id)}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <div className="pos-total-row">
                    <span>Total</span>
                    <strong>{formatPrice(cartTotal)}</strong>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    disabled={checkingOut || cart.length === 0}
                    onClick={() => void completeSale()}
                  >
                    {checkingOut ? 'Processing…' : 'Complete sale'}
                  </button>
                </div>
              </section>
            </div>
          ) : (
            <section className="db-widget">
              <div className="db-widget-header">
                <h2 className="db-widget-title">Recent sales ({orders.length})</h2>
              </div>
              {loading ? (
                <p className="db-welcome-sub">Loading…</p>
              ) : orders.length === 0 ? (
                <p className="db-welcome-sub">No sales yet. Complete a sale from the Sell tab.</p>
              ) : (
                <div className="pos-history">
                  {orders.map((order) => (
                    <article key={order.id} className={`pos-history-card${order.status === 'voided' ? ' voided' : ''}`}>
                      <div className="pos-history-top">
                        <div>
                          <strong>{order.orderNumber}</strong>
                          <div className="db-trend-sub">
                            {new Date(order.createdAt).toLocaleString()} · {paymentLabel(order.paymentMethod)}
                            {order.customerName ? ` · ${order.customerName}` : ''}
                          </div>
                        </div>
                        <div className="pos-history-total">
                          {formatPrice(order.total)}
                          <span className={`pos-status ${order.status}`}>{order.status}</span>
                        </div>
                      </div>
                      <ul className="pos-history-items">
                        {order.items.map((item) => (
                          <li key={`${order.id}-${item.productId}`}>
                            {item.name} × {item.quantity} — {formatPrice(item.price * item.quantity)}
                          </li>
                        ))}
                      </ul>
                      <div className="pos-history-actions">
                        <button type="button" className="btn btn-sm btn-outline" onClick={() => printReceipt(order)}>
                          Receipt
                        </button>
                        {order.status === 'completed' && (
                          <button type="button" className="btn btn-sm btn-outline" onClick={() => void handleVoid(order)}>
                            Void & restore stock
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
