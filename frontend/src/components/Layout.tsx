import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Toast from './Toast';

/**
 * Layout Component
 * 
 * The main application layout wrapper.
 * Enforces a consistent structure with a sticky header (Navbar),
 * flexible main content area, and a footer.
 */
const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <Navbar />
      
      {/* Main Content Area */}
      {/* flex-grow ensures the footer stays at the bottom even with little content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Renders the child route's element */}
        <Outlet />
      </main>
      
      {/* Site Footer */}
      <Footer />

      {/* Global Toast Notifications */}
      <Toast />
    </div>
  );
};

export default Layout;
