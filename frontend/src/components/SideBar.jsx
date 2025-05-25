import React from 'react';
import { Home, Crown, BookOpen, Heart, Menu } from 'lucide-react';
import {Link} from 'react-router'

import { useState } from "react";

const Sidebar = ({initialCollapsed = false}) => {
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  return (
    <div
      className={`bg-white h-screen shadow-md flex flex-col transition-all md duration-300${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        {!collapsed && (
          <div className="flex items-center">
            <span className="font-bold text-lg text-gray-800">Menu</span>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)}>
          <Menu className="h-6 w-6 text-gray-800" />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 pt-4">
        <ul className="space-y-6">
          {[{ icon: Home, label: "Dashboard", href: "/dashboard" }, { icon: Crown, label: "Leaderboard", href: "/leaderboard" }, { icon: BookOpen, label: "My reads", href: "/my-reads" }, { icon: Heart, label: "Wishlist", href: "/wishlist" }].map((item, index) => (
            <li key={index}>
              <Link to={item.href}
                className="flex items-center text-gray-700 hover:text-gray-900"
              >
                <item.icon className="h-5 w-5 mr-3" />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};


export default Sidebar;