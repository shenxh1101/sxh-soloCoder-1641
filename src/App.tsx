import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import DishList from '@/pages/DishList';
import Statistics from '@/pages/Statistics';
import CostCards from '@/pages/CostCards';
import Sorting from '@/pages/Sorting';
import { useTimedSchedule } from '@/hooks/useTimedSchedule';

function App() {
  useTimedSchedule();

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-stone-50">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/dishes" replace />} />
            <Route path="/dishes" element={<DishList />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/cost-cards" element={<CostCards />} />
            <Route path="/sorting" element={<Sorting />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
