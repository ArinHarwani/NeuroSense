import type { Metadata, Viewport } from 'next';
import './globals.css';
import { TestWorkflowProvider } from '@/context/TestWorkflowContext';
import { NavigationSidebar } from '@/components/NavigationSidebar';
import { HeaderBar } from '@/components/HeaderBar';

export const metadata: Metadata = {
  title: 'NarcoSense | AI-Assisted Breath Screening Platform',
  description: 'First-round hackathon prototype for multimodal AI-assisted breath and visual narcotics screening.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0F172A',
};

import { SessionProvider } from '@/context/SessionContext';
import { OfficerLoginModal } from '@/components/OfficerLoginModal';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <TestWorkflowProvider>
            <OfficerLoginModal />
            <div className="app-shell">
              <NavigationSidebar />
              <div className="app-main-content">
                <HeaderBar />
                <main className="app-page-body">{children}</main>
              </div>
            </div>
          </TestWorkflowProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
