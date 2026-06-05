import './globals.css';
import { AppProvider } from '@/contexts/AppContext';
import { Loader } from '@/components/ui/Loader';
import { ToastContainer } from '@/components/ui/Toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export const metadata = {
  title: 'Kalkulator SDMK',
  description: 'Analisis Kebutuhan Sumber Daya Manusia Kesehatan',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <AppProvider>
          <Loader />
          <ToastContainer />
          <ConfirmModal />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
