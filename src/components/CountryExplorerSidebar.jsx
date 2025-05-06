import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Globe,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Eye,
} from 'lucide-react';
import sideBarMenuItems from '../constent/sideBarMenuItems';    // ← same file

const CountryExplorerNavbar = () => {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [isMobile, setIsMobile]               = useState(false);
  const [mobileOpen, setMobileOpen]           = useState(false);
  const [openSubmenu, setOpenSubmenu]         = useState(null);
  const [activePath, setActivePath]           = useState('/');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [userData, setUserData]               = useState({ fullName: 'Guest User', role: 'Free Account' });

  const menuItems = sideBarMenuItems;         // ✅ still using your menu config

  /* ─────────────────────────────────────────────────────────── Responsive */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* ─────────────────────────────────────────────────────────── Active link */
  useEffect(() => {
    setActivePath(location.pathname);
    // keep parent submenu open when you navigate into a child
    const parent = menuItems.find(m => m.submenu?.some(s => s.path === location.pathname));
    setOpenSubmenu(parent?.id ?? null);
  }, [location.pathname, menuItems]);

  /* ─────────────────────────────────────────────────────────── User data  */
  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setUserData({
          fullName: user.fullName ,
          role:     user.role     
        });
      } catch (e) {
        console.error('error parsing user', e);
      }
    }
    else{
      //display button for sign in and sign up
      setUserData({
        fullName: 'Guest User',
        role:     'Free Account'
      });
    }
  }, []);

  /* ─────────────────────────────────────────────────────────── Helpers    */
  const goto         = p => {navigate(p); isMobile && setMobileOpen(false);}
  const initials     = name =>
    (!name || name === 'Guest User')
      ? 'GU'
      : name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  /* ─────────────────────────────────────────────────────────── Render     */
  return (
    <>
      {/* ─────────────── Top bar container ─────────────── */}
      <header className="fixed inset-x-0 top-0 z-40 bg-gray-800 shadow-lg">
        <div className="mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Brand / logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => goto('/')}
          >
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <span className="ml-2 hidden sm:inline-block text-lg font-bold text-white">
              Gloable<span className="text-blue-400">Exp</span>
            </span>
          </div>

          {/* Desktop menu */}
          <nav className="hidden md:flex items-center space-x-2">
            {menuItems.map(item =>
              item.submenu ? (
                /* parent with dropdown */
                <div key={item.id} className="relative">
                  <button
                    onClick={() => setOpenSubmenu(openSubmenu === item.id ? null : item.id)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition
                      ${openSubmenu === item.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}
                    `}
                  >
                    <item.icon className="w-4 h-4 mr-1.5" />
                    {item.label}
                    <ChevronDown className={`w-4 h-4 ml-1 transition-transform
                      ${openSubmenu === item.id ? 'rotate-180' : ''}`} />
                  </button>

                  {/* dropdown list */}
                  {openSubmenu === item.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg overflow-hidden z-50">
                      {item.submenu.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => goto(sub.path)}
                          className={`flex w-full items-center px-3 py-2 text-sm transition
                            ${activePath === sub.path
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-200 hover:bg-gray-700'}
                          `}
                        >
                          <sub.icon className="w-4 h-4 mr-2" />
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* simple link */
                <button
                  key={item.id}
                  onClick={() => goto(item.path)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition
                    ${activePath === item.path
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'}
                  `}
                >
                  <item.icon className="w-4 h-4 mr-1.5" />
                  {item.label}
                </button>
              )
            )}
          </nav>

          {/* Right-hand user / hamburger */}
          <div className="flex items-center space-x-2">
            {/* user mini card (desktop only) */}
            <div className="hidden md:flex items-center space-x-2 pr-2 border-r border-gray-700">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500">
                <span className="text-xs font-medium text-white">{initials(userData.fullName)}</span>
              </div>
              <div className="leading-tight">
                <p className="text-sm text-white">{userData.fullName}</p>
                <p className="text-xs text-gray-400">{userData.role}</p>
              </div>
            </div>

            {/* logout button (desktop only) */}

            {/*display button for sign in and sign up*/}
            {userData.fullName === 'Guest User' ? (
              <div className="hidden md:flex space-x-2">
                <button

                  onClick={() => goto('/signin')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Sign In
                </button>
               
              </div>
            ) : (
              <button

                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:bg-red-600 hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-1.5" />
                Logout
              </button>
            )}
            

            {/* hamburger (mobile) */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile slide-down panel */}
        {mobileOpen && (
          <div className="md:hidden bg-gray-800 border-t border-gray-700 shadow-inner">
            {menuItems.map(item =>
              item.submenu ? (
                <div key={item.id} className="border-b border-gray-700">
                  <button
                    onClick={() => setOpenSubmenu(openSubmenu === item.id ? null : item.id)}
                    className="flex w-full items-center justify-between px-4 py-3 text-gray-200 hover:bg-gray-700"
                  >
                    <span className="flex items-center">
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${openSubmenu === item.id ? 'rotate-180' : ''}`} />
                  </button>
                  {openSubmenu === item.id && (
                    <div className="px-6 py-1 space-y-1">
                      {item.submenu.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => goto(sub.path)}
                          className={`flex w-full items-center px-2 py-2 rounded-md text-sm
                            ${activePath === sub.path
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-200 hover:bg-gray-700'}
                          `}
                        >
                          <sub.icon className="w-4 h-4 mr-2" />
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  key={item.id}
                  onClick={() => goto(item.path)}
                  className={`flex w-full items-center px-4 py-3 text-gray-200 hover:bg-gray-700 border-b border-gray-700
                    ${activePath === item.path ? 'bg-blue-600 text-white' : ''}
                  `}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </button>
              )
            )}

            {/* mobile logout */}
            <button
              onClick={() => {setShowLogoutConfirm(true); setMobileOpen(false);}}
              className="flex w-full items-center px-4 py-3 text-red-400 hover:bg-red-600 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        )}
      </header>

      {/* ─────────────── Confirmation dialog (re-used) ─────────────── */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-5 m-4 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Confirm Logout</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to log out?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">
                Cancel
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  navigate('/signin');
                  setShowLogoutConfirm(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CountryExplorerNavbar;
