import React, { useState } from 'react';
import { UserRole } from '../App';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface LayoutProps {
  children: React.ReactNode;
  currentRole: UserRole;
  currentPage: string;
  navigate: (page: string) => void;
  setRole: (role: UserRole) => void;
}

export function Layout({ children, currentRole, currentPage, navigate, setRole }: LayoutProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF9EF' }}>
      <TopBar currentRole={currentRole} setRole={setRole} />
      <div className="flex">
        <Sidebar currentRole={currentRole} currentPage={currentPage} navigate={navigate} />
        <main className="flex-1 p-8 ml-64 mt-16">
          {children}
        </main>
      </div>
    </div>
  );
}
