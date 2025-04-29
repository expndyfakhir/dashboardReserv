'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { HomeIcon, TableCellsIcon, CalendarIcon, UsersIcon, ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const baseNavigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
    { name: 'Tables', href: '/admin/tables', icon: TableCellsIcon },
    { name: 'Reservations', href: '/admin/reservations', icon: CalendarIcon },
    { name: 'Calendar', href: '/admin/calendar', icon: CalendarIcon },
  ];

  const adminNavigation = [
    ...baseNavigation,
    ...(session?.user?.role === 'SUPER_ADMIN' 
      ? [{ name: 'Users', href: '/admin/users', icon: UsersIcon }]
      : [])
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="fixed z-50 bottom-4 right-4 p-2 rounded-full bg-blue-600 text-white shadow-lg md:hidden"
      >
        {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
      </button>

      {/* Desktop menu toggle button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="fixed z-50 top-4 left-4 p-2.5 rounded-full bg-white text-slate-600 shadow-lg hidden md:flex items-center justify-center hover:bg-slate-50 transition-all duration-200 border border-slate-200/50"
      >
        <Bars3Icon className={`h-5 w-5 absolute transition-all duration-300 ${isMenuOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`} />
        <XMarkIcon className={`h-5 w-5 absolute transition-all duration-300 ${isMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`} />
      </button>

      <nav 
        className={`fixed h-full transition-all duration-300 ease-in-out z-40 bg-white/80 backdrop-blur-lg border-r border-slate-200/50 ${isMenuOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'}`}
      >
        <div className="h-full flex flex-col overflow-hidden">
          <div className="flex-shrink-0 flex items-center justify-center h-20 bg-gradient-to-r from-[#316160] to-[#316160]/80">
            <h1 className={`text-xl font-bold text-white transition-opacity duration-200 ${isMenuOpen ? 'opacity-100' : 'opacity-0 md:opacity-0'}`}>El Manzah Admin</h1>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="flex-1 space-y-1 px-2 py-4">
              {adminNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${pathname === item.href
                      ? 'bg-gradient-to-r from-[#316160]/10 to-[#316160]/5 text-[#316160] shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50/50 hover:text-[#316160]'
                    } group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 backdrop-blur-sm`}
                  >
                    <Icon className={`h-5 w-5 transition-all duration-200 ${isMenuOpen ? 'mr-3' : 'mx-auto'}`} />
                    <span className={`transition-all duration-200 ${isMenuOpen ? 'opacity-100 block' : 'opacity-0 hidden'}`}>
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
            <div className="px-2 py-4 border-t border-gray-200">
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-all duration-200 backdrop-blur-sm"
              >
                <ArrowRightOnRectangleIcon className={`h-5 w-5 transition-all duration-200 ${isMenuOpen ? 'mr-3' : 'mx-auto'}`} />
                <span className={`transition-all duration-200 ${isMenuOpen ? 'opacity-100 block' : 'opacity-0 hidden'}`}>
                  Logout
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className={`flex-1 transition-all duration-300 ease-in-out ${isMenuOpen ? 'ml-64' : 'ml-0 md:ml-20'}`}>
        <div className="py-6 px-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}