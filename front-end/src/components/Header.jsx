import React, { useState } from 'react';
import { Search, Bell, LogOut } from 'lucide-react';

export default function Header({ title = "Dashboard", user, onSignOut }) {
  const [showDropdown, setShowDropdown] = useState(false);

  const getInitials = (email) => {
    return email ? email.substring(0, 2).toUpperCase() : 'U';
  };

  return (
    <div className="bg-white border-b border-stone-200 px-15 py-3 sticky top-0 z-10 flex items-center justify-between">
      <div className="text-sm text-stone-500">
        <span className="text-stone-900">{title}</span>
      </div>
      <div className="flex items-center gap-3">
        <button className="w-8 h-8 rounded hover:bg-stone-100 flex items-center justify-center text-stone-500 transition-colors">
          <Search size={16} />
        </button>
        <button className="w-8 h-8 rounded hover:bg-stone-100 flex items-center justify-center text-stone-500 transition-colors">
          <Bell size={16} />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold cursor-pointer hover:shadow-md transition-shadow"
          >
            {getInitials(user?.email)}
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-stone-200 rounded-md shadow-lg z-50">
              <div className="p-3 border-b border-stone-200">
                <div className="text-sm font-medium text-stone-900 truncate">
                  {user?.email}
                </div>
              </div>
              <button
                onClick={() => {
                  onSignOut();
                  setShowDropdown(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}