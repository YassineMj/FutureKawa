import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Menu } from 'lucide-react';

export default function DashboardLayout({
  children,
  navItems = [],
  title = 'Vue consolidée',
  topTabs = [],
  activeTab = 'all',
  onTabChange = () => {},
  user = {
    initials: 'SA',
    name: 'Super Admin',
    role: 'Siège · tous pays',
  },
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Overlay mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen}  navItems={navItems}/>

      <div className="lg:ml-72 flex flex-col min-h-screen">
        {/* TOPBAR */}
        <header className="h-20 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            <span className="text-lg sm:text-xl font-medium text-slate-700">
              {title}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Tabs pays */}
            {topTabs.length > 0 && (
              <div className="hidden md:flex items-center bg-slate-100 border border-slate-200 rounded-full p-1">
                {topTabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* User */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center border border-emerald-200">
                {user.initials}
              </div>
              <div className="hidden sm:block leading-tight">
                <div className="font-semibold text-slate-800">{user.name}</div>
                <div className="text-sm text-slate-400">{user.role}</div>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}