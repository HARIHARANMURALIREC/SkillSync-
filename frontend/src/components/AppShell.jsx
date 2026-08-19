import { useState } from 'react';
import Aurora from './ui/Aurora';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function AppShell({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative min-h-screen bg-bg text-fg">
      <Aurora variant="page" />
      <Sidebar isOpen={open} onClose={() => setOpen(false)} />
      <div className="relative flex min-h-screen flex-col lg:ml-64">
        <Navbar onMenuClick={() => setOpen(true)} />
        <main className="relative mx-auto w-full max-w-6xl flex-1 px-5 py-8 md:px-10">{children}</main>
      </div>
    </div>
  );
}
