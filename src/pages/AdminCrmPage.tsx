import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AdminSidebar, type AdminNavKey } from '../components/admin/AdminSidebar';
import { formatPrice } from '../data/products';
import { BRAND } from '../data/brand';
import {
  createCampaign,
  createCustomer,
  createLead,
  createStaff,
  deleteCampaign,
  deleteCustomer,
  deleteLead,
  deleteSubscriber,
  fetchAdminOrders,
  fetchCampaigns,
  fetchCrmDashboard,
  fetchCustomers,
  fetchFollowUps,
  fetchLeads,
  fetchNotifications,
  fetchReports,
  fetchSettings,
  fetchStaff,
  fetchSubscribers,
  markNotificationsRead,
  updateAdminOrder,
  updateCampaign,
  updateCustomer,
  updateLead,
  updateSettings,
  updateStaff,
  voidAdminOrder,
  type AdminOrder,
  type BusinessSettings,
  type Campaign,
  type CrmCustomer,
  type CrmDashboard,
  type Lead,
} from '../services/crmService';
import { fetchOrderStats, type OrderStats } from '../services/orderService';

type CrmTab =
  | 'overview'
  | 'customers'
  | 'orders'
  | 'sales'
  | 'whatsapp'
  | 'marketing'
  | 'leads'
  | 'followups'
  | 'loyalty'
  | 'delivery'
  | 'reports'
  | 'staff'
  | 'notifications'
  | 'subscribers'
  | 'settings';

const TABS: { id: CrmTab; label: string }[] = [
  { id: 'overview', label: 'Dashboard' },
  { id: 'customers', label: 'Customers' },
  { id: 'orders', label: 'Orders' },
  { id: 'sales', label: 'Sales & Revenue' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'leads', label: 'Leads' },
  { id: 'followups', label: 'Follow-ups' },
  { id: 'loyalty', label: 'Loyalty & VIP' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'reports', label: 'Reports' },
  { id: 'subscribers', label: 'Subscribers' },
  { id: 'staff', label: 'Staff' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'settings', label: 'Settings' },
];

const ORDER_STATUSES = ['new', 'confirmed', 'processing', 'ready', 'delivered', 'completed', 'cancelled'];
const PAY_STATUSES = ['pending', 'partially_paid', 'paid', 'refunded'];
const LEAD_STAGES = ['new', 'contacted', 'interested', 'follow_up', 'converted', 'lost'];

function waLink(phone: string, text: string) {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function AdminCrmPage() {
  const [tab, setTab] = useState<CrmTab>('overview');
  const [dash, setDash] = useState<CrmDashboard | null>(null);
  const [sales, setSales] = useState<OrderStats | null>(null);
  const [customers, setCustomers] = useState<CrmCustomer[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [subscribers, setSubscribers] = useState<{ id: string; email: string; subscribedAt: string; source: string }[]>([]);
  const [followUps, setFollowUps] = useState<Record<string, unknown> | null>(null);
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; createdAt: string; read: boolean }[]>([]);
  const [staff, setStaff] = useState<{ id: string; name: string; email: string; role: string; active: boolean }[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');
  const [reports, setReports] = useState<Record<string, unknown> | null>(null);
  const [reportRange, setReportRange] = useState('monthly');
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [customerForm, setCustomerForm] = useState({ name: '', email: '', phone: '', location: '', notes: '' });
  const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '', source: 'manual', interest: '' });
  const [campaignForm, setCampaignForm] = useState({ name: '', channel: 'instagram', targetAudience: '' });
  const [staffForm, setStaffForm] = useState({ name: '', email: '', password: '', role: 'pos_staff' });
  const [waCustomer, setWaCustomer] = useState('');
  const [waTemplate, setWaTemplate] = useState('confirm');

  const reload = async () => {
    setLoading(true);
    setError('');
    try {
      const [d, s, c, o, l, camp, sub, fu, n] = await Promise.all([
        fetchCrmDashboard(),
        fetchOrderStats().catch(() => null),
        fetchCustomers(q),
        fetchAdminOrders(120),
        fetchLeads(),
        fetchCampaigns(),
        fetchSubscribers(),
        fetchFollowUps(),
        fetchNotifications(),
      ]);
      setDash(d);
      setSales(s);
      setCustomers(c);
      setOrders(o);
      setLeads(l);
      setCampaigns(camp);
      setSubscribers(sub);
      setFollowUps(fu);
      setNotifications(n);
      if (tab === 'staff') setStaff(await fetchStaff());
      if (tab === 'reports' || tab === 'sales') setReports(await fetchReports(reportRange));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load CRM');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, reportRange]);

  useEffect(() => {
    if (tab !== 'settings') return;
    setSettingsMsg('');
    void fetchSettings()
      .then(setSettings)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load settings'));
  }, [tab]);

  const saveSettings = async (e: FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSettingsSaving(true);
    setSettingsMsg('');
    setError('');
    try {
      const saved = await updateSettings({
        businessName: settings.businessName.trim(),
        logoUrl: settings.logoUrl.trim(),
        brandColor: settings.brandColor.trim(),
        phone: settings.phone.trim(),
        whatsapp: settings.whatsapp.trim(),
        email: settings.email.trim(),
        address: settings.address.trim(),
        currency: settings.currency.trim() || 'LSL',
        currencySymbol: settings.currencySymbol.trim() || 'M',
        paymentMethods: settings.paymentMethods,
        deliveryFee: Number(settings.deliveryFee) || 0,
        lowStockThreshold: Number(settings.lowStockThreshold) || 0,
      });
      setSettings(saved);
      setSettingsMsg('Settings saved successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save settings');
    } finally {
      setSettingsSaving(false);
    }
  };

  const togglePaymentMethod = (method: string) => {
    if (!settings) return;
    const has = settings.paymentMethods.includes(method);
    setSettings({
      ...settings,
      paymentMethods: has
        ? settings.paymentMethods.filter((m) => m !== method)
        : [...settings.paymentMethods, method],
    });
  };

  const templates = useMemo(() => {
    const name = waCustomer || 'Customer';
    const order = orders[0]?.orderNumber || '#ORDER';
    return {
      confirm: `Hello ${name}, your order ${order} has been confirmed. Thank you for shopping with ${BRAND.name}!`,
      payment: `Hello ${name}, we have received your payment for order ${order}. Thank you!`,
      delivery: `Hello ${name}, your order ${order} is out for delivery / ready for pickup.`,
      promo: `Hello ${name}! New arrivals & glow deals at ${BRAND.name}. Reply YES for today's offer.`,
      followup: `Hello ${name}, just checking in — still interested in our skincare? We're happy to help.`,
    } as Record<string, string>;
  }, [waCustomer, orders]);

  const addCustomer = async (e: FormEvent) => {
    e.preventDefault();
    await createCustomer({ ...customerForm, status: 'new', source: 'manual' });
    setCustomerForm({ name: '', email: '', phone: '', location: '', notes: '' });
    await reload();
  };

  const navActive: AdminNavKey = 'crm';

  return (
    <div className="db-root">
      <AdminSidebar active={navActive} />
      <main className="db-main">
        <header className="db-topbar">
          <div className="db-topbar-left">
            <h1 className="db-topbar-title">CRM</h1>
            <p className="db-topbar-date">Customers, orders, marketing, delivery & staff — all in one place</p>
          </div>
          <button type="button" className="pos-tab-btn" onClick={() => void reload()} disabled={loading}>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </header>

        <div className="db-content">
          {error && <div className="auth-error" role="alert" style={{ marginBottom: 12 }}>⚠️ {error}</div>}

          <div className="crm-tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`crm-tab${tab === t.id ? ' active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'overview' && dash && (
            <>
              <div className="db-grid-4">
                {[
                  ['Total customers', dash.totalCustomers],
                  ['New customers', dash.newCustomers],
                  ['Total orders', dash.totalOrders],
                  ['Pending orders', dash.pendingOrders],
                  ['Completed orders', dash.completedOrders],
                  ['Cancelled orders', dash.cancelledOrders],
                  ['Total sales', formatPrice(dash.totalSales)],
                  ['Outstanding', formatPrice(dash.outstandingPayments)],
                  ['Subscribers', dash.subscribers],
                  ['Open leads', dash.openLeads],
                  ['Follow-ups due', dash.followUpDue],
                  ['Low stock', dash.lowStockCount],
                ].map(([label, value]) => (
                  <div className="db-metric-card" key={String(label)}>
                    <div className="db-metric-label">{label}</div>
                    <div className="db-metric-value" style={{ fontSize: '1.35rem' }}>{value}</div>
                  </div>
                ))}
              </div>
              <div className="db-layout-split" style={{ marginTop: 16 }}>
                <section className="db-widget">
                  <h2 className="db-widget-title">Recent activity</h2>
                  {dash.recentActivity.map((a) => (
                    <div key={a.id} className="db-stock-meta">
                      <span className="db-stock-name">{a.title}</span>
                      <span className="db-trend-sub">{a.message}</span>
                    </div>
                  ))}
                  {!dash.recentActivity.length && <p className="db-welcome-sub">No activity yet.</p>}
                </section>
                <section className="db-widget">
                  <h2 className="db-widget-title">Low stock alerts</h2>
                  {dash.lowStock.map((p) => (
                    <div key={p.id} className="db-stock-meta">
                      <span className="db-stock-name">{p.name}</span>
                      <span className="db-stock-count low">{p.stock} left</span>
                    </div>
                  ))}
                  {!dash.lowStock.length && <p className="db-welcome-sub">All stock levels look healthy.</p>}
                  {sales && (
                    <p className="db-welcome-sub" style={{ marginTop: 12 }}>
                      Sales growth: {sales.todayOrderCount} sales today · {formatPrice(sales.todayRevenue)}
                    </p>
                  )}
                </section>
              </div>
            </>
          )}

          {tab === 'customers' && (
            <section className="db-widget">
              <div className="db-widget-header">
                <h2 className="db-widget-title">Customer management</h2>
                <input className="auth-input" style={{ maxWidth: 220 }} placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} onBlur={() => void reload()} />
              </div>
              <form className="crm-inline-form" onSubmit={(e) => void addCustomer(e)}>
                <input className="auth-input" placeholder="Name *" required value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} />
                <input className="auth-input" placeholder="Phone" value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} />
                <input className="auth-input" placeholder="Email" value={customerForm.email} onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} />
                <input className="auth-input" placeholder="Location" value={customerForm.location} onChange={(e) => setCustomerForm({ ...customerForm, location: e.target.value })} />
                <button className="btn btn-primary" type="submit">Add customer</button>
              </form>
              <div className="crm-table">
                {customers.map((c) => (
                  <article key={c.id} className="crm-row">
                    <div>
                      <strong>{c.name}</strong>
                      <div className="db-trend-sub">{c.phone || '—'} · {c.email || '—'} · {c.status} · {c.loyaltyTier}</div>
                      <div className="db-trend-sub">Spent {formatPrice(c.totalSpent)} · Source {c.source}</div>
                    </div>
                    <div className="crm-row-actions">
                      {c.phone && (
                        <>
                          <a className="pos-tab-btn" href={`tel:${c.phone}`}>Call</a>
                          <a className="pos-tab-btn" href={waLink(c.whatsapp || c.phone, `Hello ${c.name},`)} target="_blank" rel="noreferrer">WhatsApp</a>
                        </>
                      )}
                      <select
                        className="auth-input"
                        style={{ width: 'auto' }}
                        value={c.status}
                        onChange={(e) => void updateCustomer(c.id, { status: e.target.value }).then(reload)}
                      >
                        <option value="new">New</option>
                        <option value="active">Active</option>
                        <option value="vip">VIP</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <button type="button" className="pos-tab-btn" onClick={() => void deleteCustomer(c.id).then(reload)}>Delete</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {tab === 'orders' && (
            <section className="db-widget">
              <h2 className="db-widget-title">Order management</h2>
              <p className="db-welcome-sub">Statuses: New → Confirmed → Processing → Ready → Delivered → Completed</p>
              <div className="crm-table">
                {orders.map((o) => (
                  <article key={o.id} className="crm-row">
                    <div>
                      <strong>{o.orderNumber}</strong> · {o.source} · {formatPrice(o.total)}
                      <div className="db-trend-sub">{o.customerName} · {o.customerPhone} · {new Date(o.createdAt).toLocaleString()}</div>
                      <div className="db-trend-sub">{o.items.map((i) => `${i.name}×${i.quantity}`).join(', ')}</div>
                      {o.deliveryAddress && <div className="db-trend-sub">{o.deliveryAddress}, {o.deliveryCity}</div>}
                    </div>
                    <div className="crm-row-actions">
                      <select className="auth-input" style={{ width: 'auto' }} value={o.status} onChange={(e) => void updateAdminOrder(o.id, { status: e.target.value }).then(reload)}>
                        {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        <option value="voided">voided</option>
                      </select>
                      <select className="auth-input" style={{ width: 'auto' }} value={o.paymentStatus} onChange={(e) => void updateAdminOrder(o.id, { paymentStatus: e.target.value }).then(reload)}>
                        {PAY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {o.customerPhone && (
                        <a className="pos-tab-btn" href={waLink(o.customerPhone, templates.confirm.replace('#ORDER', o.orderNumber).replace(orders[0]?.orderNumber || '', o.orderNumber))} target="_blank" rel="noreferrer">WA confirm</a>
                      )}
                      {!['voided', 'cancelled'].includes(o.status) && (
                        <button type="button" className="pos-tab-btn" onClick={() => void voidAdminOrder(o.id).then(reload)}>Void/Cancel</button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {tab === 'sales' && (
            <section className="db-widget">
              <h2 className="db-widget-title">Sales & revenue</h2>
              <div className="db-grid-4">
                <div className="db-metric-card"><div className="db-metric-label">Total revenue</div><div className="db-metric-value">{formatPrice(sales?.totalSales ?? 0)}</div></div>
                <div className="db-metric-card"><div className="db-metric-label">Today</div><div className="db-metric-value">{formatPrice(sales?.todayRevenue ?? 0)}</div></div>
                <div className="db-metric-card"><div className="db-metric-label">Orders</div><div className="db-metric-value">{sales?.orderCount ?? 0}</div></div>
                <div className="db-metric-card"><div className="db-metric-label">Growth %</div><div className="db-metric-value">{String((reports as { salesGrowthPercent?: number } | null)?.salesGrowthPercent ?? '—')}</div></div>
              </div>
              <h3 className="db-widget-title" style={{ marginTop: 16 }}>By payment / product</h3>
              <p className="db-welcome-sub">Open Reports tab for daily/weekly/monthly/annual breakdowns and CSV export.</p>
              <ul>
                {orders.filter((o) => !['voided', 'cancelled'].includes(o.status)).slice(0, 15).map((o) => (
                  <li key={o.id} className="db-trend-sub">{o.orderNumber}: {formatPrice(o.total)} · {o.paymentMethod} · {o.paymentStatus}</li>
                ))}
              </ul>
            </section>
          )}

          {tab === 'whatsapp' && (
            <section className="db-widget">
              <h2 className="db-widget-title">WhatsApp & communication</h2>
              <div className="crm-inline-form">
                <input className="auth-input" placeholder="Customer name" value={waCustomer} onChange={(e) => setWaCustomer(e.target.value)} />
                <select className="auth-input" value={waTemplate} onChange={(e) => setWaTemplate(e.target.value)}>
                  <option value="confirm">Order confirmation</option>
                  <option value="payment">Payment confirmation</option>
                  <option value="delivery">Delivery notification</option>
                  <option value="promo">Promotional</option>
                  <option value="followup">Follow-up reminder</option>
                </select>
              </div>
              <textarea className="auth-input" rows={4} readOnly value={templates[waTemplate]} />
              <p className="db-welcome-sub">Pick a customer with a phone number from Customers/Orders, then open WhatsApp:</p>
              <div className="crm-table">
                {customers.filter((c) => c.phone).slice(0, 20).map((c) => (
                  <div key={c.id} className="crm-row">
                    <span>{c.name} · {c.phone}</span>
                    <a className="btn btn-primary btn-sm" href={waLink(c.whatsapp || c.phone, templates[waTemplate].replace(waCustomer || 'Customer', c.name))} target="_blank" rel="noreferrer">Send via WhatsApp</a>
                  </div>
                ))}
              </div>
            </section>
          )}

          {tab === 'marketing' && (
            <section className="db-widget">
              <h2 className="db-widget-title">Marketing CRM</h2>
              <form className="crm-inline-form" onSubmit={(e) => { e.preventDefault(); void createCampaign(campaignForm).then(() => { setCampaignForm({ name: '', channel: 'instagram', targetAudience: '' }); return reload(); }); }}>
                <input className="auth-input" placeholder="Campaign name" required value={campaignForm.name} onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })} />
                <select className="auth-input" value={campaignForm.channel} onChange={(e) => setCampaignForm({ ...campaignForm, channel: e.target.value })}>
                  {['facebook', 'instagram', 'tiktok', 'whatsapp', 'website', 'referral'].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input className="auth-input" placeholder="Target audience" value={campaignForm.targetAudience} onChange={(e) => setCampaignForm({ ...campaignForm, targetAudience: e.target.value })} />
                <button className="btn btn-primary" type="submit">Create campaign</button>
              </form>
              {campaigns.map((c) => (
                <article key={c.id} className="crm-row">
                  <div>
                    <strong>{c.name}</strong> · {c.channel} · {c.status}
                    <div className="db-trend-sub">Leads {c.leadsGenerated} · Customers {c.customersAcquired} · Sales {formatPrice(c.salesGenerated)} · ROI {c.roi ?? '—'}%</div>
                  </div>
                  <div className="crm-row-actions">
                    <select className="auth-input" style={{ width: 'auto' }} value={c.status} onChange={(e) => void updateCampaign(c.id, { status: e.target.value }).then(reload)}>
                      <option value="draft">draft</option>
                      <option value="active">active</option>
                      <option value="paused">paused</option>
                      <option value="completed">completed</option>
                    </select>
                    <button type="button" className="pos-tab-btn" onClick={() => void deleteCampaign(c.id).then(reload)}>Delete</button>
                  </div>
                </article>
              ))}
            </section>
          )}

          {tab === 'leads' && (
            <section className="db-widget">
              <h2 className="db-widget-title">Leads management</h2>
              <form className="crm-inline-form" onSubmit={(e) => { e.preventDefault(); void createLead(leadForm).then(() => { setLeadForm({ name: '', email: '', phone: '', source: 'manual', interest: '' }); return reload(); }); }}>
                <input className="auth-input" placeholder="Lead name *" required value={leadForm.name} onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })} />
                <input className="auth-input" placeholder="Phone" value={leadForm.phone} onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })} />
                <input className="auth-input" placeholder="Email" value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} />
                <input className="auth-input" placeholder="Interest" value={leadForm.interest} onChange={(e) => setLeadForm({ ...leadForm, interest: e.target.value })} />
                <button className="btn btn-primary" type="submit">Add lead</button>
              </form>
              {leads.map((l) => (
                <article key={l.id} className="crm-row">
                  <div>
                    <strong>{l.name}</strong> · {l.source}
                    <div className="db-trend-sub">{l.phone} · {l.email} · {l.interest || l.message}</div>
                  </div>
                  <div className="crm-row-actions">
                    <select className="auth-input" style={{ width: 'auto' }} value={l.stage} onChange={(e) => void updateLead(l.id, { stage: e.target.value }).then(reload)}>
                      {LEAD_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {l.phone && <a className="pos-tab-btn" href={waLink(l.phone, templates.followup.replace(waCustomer || 'Customer', l.name))} target="_blank" rel="noreferrer">WhatsApp</a>}
                    <button type="button" className="pos-tab-btn" onClick={() => void deleteLead(l.id).then(reload)}>Delete</button>
                  </div>
                </article>
              ))}
            </section>
          )}

          {tab === 'followups' && followUps && (
            <section className="db-widget">
              <h2 className="db-widget-title">Customer follow-up system</h2>
              <div className="db-grid-4">
                {Object.entries((followUps.counts as Record<string, number>) || {}).map(([k, v]) => (
                  <div className="db-metric-card" key={k}><div className="db-metric-label">{k}</div><div className="db-metric-value">{v}</div></div>
                ))}
              </div>
              <h3 className="db-widget-title">Inactive 30+ days</h3>
              {((followUps.inactive30 as CrmCustomer[]) || []).slice(0, 15).map((c) => (
                <div key={c.id} className="crm-row"><span>{c.name} · {c.phone}</span>{c.phone && <a className="pos-tab-btn" href={waLink(c.phone, templates.followup.replace('Customer', c.name))} target="_blank" rel="noreferrer">Follow up</a>}</div>
              ))}
            </section>
          )}

          {tab === 'loyalty' && (
            <section className="db-widget">
              <h2 className="db-widget-title">Loyalty & VIP</h2>
              <p className="db-welcome-sub">Tiers: Bronze → Silver → Gold → VIP (auto from spend). Points = total spent ÷ 10.</p>
              {customers.slice().sort((a, b) => b.loyaltyPoints - a.loyaltyPoints).map((c) => (
                <div key={c.id} className="crm-row">
                  <div><strong>{c.name}</strong> · {c.loyaltyTier.toUpperCase()} · {c.loyaltyPoints} pts · Spent {formatPrice(c.totalSpent)}</div>
                  <select className="auth-input" style={{ width: 'auto' }} value={c.loyaltyTier} onChange={(e) => void updateCustomer(c.id, { loyaltyTier: e.target.value, status: e.target.value === 'vip' ? 'vip' : c.status }).then(reload)}>
                    <option value="bronze">bronze</option>
                    <option value="silver">silver</option>
                    <option value="gold">gold</option>
                    <option value="vip">vip</option>
                  </select>
                </div>
              ))}
            </section>
          )}

          {tab === 'delivery' && (
            <section className="db-widget">
              <h2 className="db-widget-title">Delivery management</h2>
              {orders.filter((o) => o.deliveryMethod === 'delivery' || o.deliveryStatus !== 'not_required').map((o) => (
                <article key={o.id} className="crm-row">
                  <div>
                    <strong>{o.orderNumber}</strong> · {o.customerName}
                    <div className="db-trend-sub">{o.deliveryAddress}, {o.deliveryCity}</div>
                  </div>
                  <div className="crm-row-actions">
                    <select className="auth-input" style={{ width: 'auto' }} value={o.deliveryStatus} onChange={(e) => void updateAdminOrder(o.id, { deliveryStatus: e.target.value, status: e.target.value === 'delivered' ? 'delivered' : o.status }).then(reload)}>
                      <option value="pending">Pending</option>
                      <option value="out_for_delivery">Out for delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="not_required">Not required</option>
                    </select>
                    <input className="auth-input" style={{ width: 120 }} placeholder="Driver" defaultValue={o.driverName} onBlur={(e) => void updateAdminOrder(o.id, { driverName: e.target.value }).then(reload)} />
                    <input className="auth-input" style={{ width: 120 }} placeholder="Tracking #" defaultValue={o.trackingNumber} onBlur={(e) => void updateAdminOrder(o.id, { trackingNumber: e.target.value }).then(reload)} />
                  </div>
                </article>
              ))}
              {!orders.some((o) => o.deliveryMethod === 'delivery') && <p className="db-welcome-sub">No delivery orders yet. Online checkout with delivery will appear here.</p>}
            </section>
          )}

          {tab === 'reports' && (
            <section className="db-widget">
              <div className="db-widget-header">
                <h2 className="db-widget-title">Reports & analytics</h2>
                <select className="auth-input" style={{ width: 'auto' }} value={reportRange} onChange={(e) => setReportRange(e.target.value)}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
              {reports && (
                <>
                  <div className="db-grid-4">
                    <div className="db-metric-card"><div className="db-metric-label">Orders</div><div className="db-metric-value">{String(reports.orderCount)}</div></div>
                    <div className="db-metric-card"><div className="db-metric-label">Revenue</div><div className="db-metric-value">{formatPrice(Number(reports.revenue || 0))}</div></div>
                    <div className="db-metric-card"><div className="db-metric-label">Customers</div><div className="db-metric-value">{String(reports.customerCount)}</div></div>
                    <div className="db-metric-card"><div className="db-metric-label">Avg order</div><div className="db-metric-value">{formatPrice(Number(reports.avgOrderValue || 0))}</div></div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ marginTop: 12 }}
                    onClick={() => {
                      const rows = [['Product', 'Qty', 'Revenue'], ...((reports.salesByProduct as { name: string; qty: number; revenue: number }[]) || []).map((r) => [r.name, String(r.qty), String(r.revenue)])];
                      const csv = rows.map((r) => r.join(',')).join('\n');
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `tpc-report-${reportRange}.csv`;
                      a.click();
                    }}
                  >
                    Export CSV
                  </button>
                </>
              )}
            </section>
          )}

          {tab === 'subscribers' && (
            <section className="db-widget">
              <h2 className="db-widget-title">Newsletter subscribers</h2>
              <p className="db-welcome-sub">People who subscribe on the website appear here.</p>
              {subscribers.map((s) => (
                <div key={s.id} className="crm-row">
                  <span>{s.email} · {new Date(s.subscribedAt).toLocaleString()} · {s.source}</span>
                  <button type="button" className="pos-tab-btn" onClick={() => void deleteSubscriber(s.id).then(reload)}>Remove</button>
                </div>
              ))}
              {!subscribers.length && <p className="db-welcome-sub">No subscribers yet.</p>}
            </section>
          )}

          {tab === 'staff' && (
            <section className="db-widget">
              <h2 className="db-widget-title">Admin & staff management</h2>
              <p className="db-welcome-sub">Create a <strong>pos_staff</strong> account for cashiers — they only see POS, not full admin/CRM.</p>
              <form className="crm-inline-form" onSubmit={(e) => { e.preventDefault(); void createStaff(staffForm).then(() => { setStaffForm({ name: '', email: '', password: '', role: 'pos_staff' }); return fetchStaff().then(setStaff); }).catch((err) => setError(err instanceof Error ? err.message : 'Failed')); }}>
                <input className="auth-input" placeholder="Name" required value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} />
                <input className="auth-input" placeholder="Email" required type="email" value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} />
                <input className="auth-input" placeholder="Password" required type="password" value={staffForm.password} onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })} />
                <select className="auth-input" value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}>
                  <option value="pos_staff">POS staff</option>
                  <option value="sales_staff">Sales staff</option>
                  <option value="delivery_staff">Delivery staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
                <button className="btn btn-primary" type="submit">Add staff</button>
              </form>
              {(staff.length ? staff : []).map((s) => (
                <div key={s.id} className="crm-row">
                  <span>{s.name} · {s.email} · {s.role} · {s.active ? 'active' : 'disabled'}</span>
                  <button type="button" className="pos-tab-btn" onClick={() => void updateStaff(s.id, { active: !s.active }).then(() => fetchStaff().then(setStaff))}>
                    {s.active ? 'Disable' : 'Enable'}
                  </button>
                </div>
              ))}
              <button type="button" className="pos-tab-btn" style={{ marginTop: 8 }} onClick={() => void fetchStaff().then(setStaff).catch((e) => setError(e.message))}>Load staff list</button>
            </section>
          )}

          {tab === 'notifications' && (
            <section className="db-widget">
              <div className="db-widget-header">
                <h2 className="db-widget-title">Notifications</h2>
                <button type="button" className="pos-tab-btn" onClick={() => void markNotificationsRead().then(reload)}>Mark all read</button>
              </div>
              {notifications.map((n) => (
                <div key={n.id} className="crm-row">
                  <div>
                    <strong>{n.title}</strong>
                    <div className="db-trend-sub">{n.message} · {new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                  <span className="db-trend-sub">{n.read ? 'Read' : 'New'}</span>
                </div>
              ))}
            </section>
          )}

          {tab === 'settings' && (
            <section className="db-widget">
              <h2 className="db-widget-title">Business settings</h2>
              <p className="db-welcome-sub">Update store details, currency, delivery fee, and low-stock alerts.</p>
              {settingsMsg && <div className="pos-success" style={{ marginTop: 12 }}>{settingsMsg}</div>}
              {!settings && <p className="db-welcome-sub">Loading settings…</p>}
              {settings && (
                <form className="crm-settings-form" onSubmit={(e) => void saveSettings(e)}>
                  <div className="crm-settings-grid">
                    <label className="auth-label">Business name
                      <input className="auth-input" value={settings.businessName} onChange={(e) => setSettings({ ...settings, businessName: e.target.value })} required />
                    </label>
                    <label className="auth-label">Brand color
                      <input className="auth-input" type="color" value={settings.brandColor || '#7A2E2E'} onChange={(e) => setSettings({ ...settings, brandColor: e.target.value })} />
                    </label>
                    <label className="auth-label">Phone
                      <input className="auth-input" value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} />
                    </label>
                    <label className="auth-label">WhatsApp number
                      <input className="auth-input" value={settings.whatsapp} onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })} />
                    </label>
                    <label className="auth-label">Email
                      <input className="auth-input" type="email" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} />
                    </label>
                    <label className="auth-label">Logo URL
                      <input className="auth-input" value={settings.logoUrl} onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })} />
                    </label>
                    <label className="auth-label" style={{ gridColumn: '1 / -1' }}>Address
                      <input className="auth-input" value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} />
                    </label>
                    <label className="auth-label">Currency code
                      <input className="auth-input" value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} placeholder="LSL" />
                    </label>
                    <label className="auth-label">Currency symbol
                      <input className="auth-input" value={settings.currencySymbol} onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })} placeholder="M" />
                    </label>
                    <label className="auth-label">Delivery fee (M)
                      <input className="auth-input" type="number" min={0} step="0.01" value={settings.deliveryFee} onChange={(e) => setSettings({ ...settings, deliveryFee: Number(e.target.value) })} />
                    </label>
                    <label className="auth-label">Low stock alert at
                      <input className="auth-input" type="number" min={0} step={1} value={settings.lowStockThreshold} onChange={(e) => setSettings({ ...settings, lowStockThreshold: Number(e.target.value) })} />
                    </label>
                  </div>

                  <div className="auth-label" style={{ marginTop: 8 }}>Payment methods</div>
                  <div className="crm-pay-methods">
                    {['cash', 'card', 'mobile_money', 'bank_transfer', 'cod'].map((method) => (
                      <label key={method} className={`crm-check${settings.paymentMethods.includes(method) ? ' on' : ''}`}>
                        <input
                          type="checkbox"
                          checked={settings.paymentMethods.includes(method)}
                          onChange={() => togglePaymentMethod(method)}
                        />
                        {method.replace('_', ' ')}
                      </label>
                    ))}
                  </div>

                  <button className="btn btn-primary" type="submit" disabled={settingsSaving} style={{ marginTop: 16 }}>
                    {settingsSaving ? 'Saving…' : 'Save settings'}
                  </button>
                </form>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
