import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import DishList from '@/pages/DishList';
import Statistics from '@/pages/Statistics';
import CostCards from '@/pages/CostCards';
import Sorting from '@/pages/Sorting';
import OrderMenu from '@/pages/OrderMenu';
import { useTimedSchedule } from '@/hooks/useTimedSchedule';

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}

function App() {
  useTimedSchedule();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dishes" replace />} />
        <Route
          path="/dishes"
          element={
            <AdminLayout>
              <DishList />
            </AdminLayout>
          }
        />
        <Route
          path="/statistics"
          element={
            <AdminLayout>
              <Statistics />
            </AdminLayout>
          }
        />
        <Route
          path="/cost-cards"
          element={
            <AdminLayout>
              <CostCards />
            </AdminLayout>
          }
        />
        <Route
          path="/sorting"
          element={
            <AdminLayout>
              <Sorting />
            </AdminLayout>
          }
        />
        <Route path="/order" element={<OrderMenu />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
