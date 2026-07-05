import { Sidebar, SidebarProvider } from './Sidebar';
import { Header } from './Header';
import { NotificationToast } from '../ui/NotificationToast';
import { ChatAssistant } from '../ai/ChatAssistant';

export function Layout({ children }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen transition-colors duration-300">
        <Sidebar />
        <main className="lg:pl-64">
          <div className="mx-auto max-w-[1400px] px-4 py-6 pt-16 lg:px-6 lg:pt-6">
            <Header />
            {children}
          </div>
        </main>
        <NotificationToast />
        <ChatAssistant />
      </div>
    </SidebarProvider>
  );
}
