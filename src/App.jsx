import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import Overview from './pages/Overview';
import Comparison from './pages/Comparison';
import Historical from './pages/Historical';
import Methods from './pages/Methods';
import Quality from './pages/Quality';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Overview />} />
        <Route path="comparison" element={<Comparison />} />
        <Route path="history" element={<Historical />} />
        <Route path="methods" element={<Methods />} />
        <Route path="quality" element={<Quality />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
