import { Outlet, Navigate } from 'react-router-dom';
import { useAdmin } from '../../context/AuthContext';
import { TopBar } from './TopBar';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileBottomNav } from './MobileBottomNav';
import { AIChatWidget } from '../ai/AIChatWidget';

interface LayoutProps {
  showTopBar?: boolean;
  showFooter?: boolean;
  showAIChat?: boolean;
  showMobileNav?: boolean;
}

export function Layout({
  showTopBar = true,
  showFooter = true,
  showAIChat = true,
  showMobileNav = true,
}: LayoutProps) {
  return (
    <>
      {showTopBar && <TopBar />}
      <Header />
      <main>
        <Outlet />
      </main>
      {showFooter && <Footer />}
      {showAIChat && <AIChatWidget />}
      {showMobileNav && <MobileBottomNav />}
    </>
  );
}

export function AdminLayout() {
  const { admin, isLoading } = useAdmin();

  if (isLoading) {
    return (
      <div className="auth-page-loading">
        <div className="auth-loading-spinner" />
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
