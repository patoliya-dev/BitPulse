import './App.css';
import Header from './components/Header';
import AppRoutes from './routes/AppRoutes';
import { useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  const hideHeaderRoutes = ['/login', '/register']; // routes without header

  const showHeader = !hideHeaderRoutes.includes(location.pathname);

  return (
    <div>
      {showHeader && <Header />}
      <AppRoutes />
    </div>
  );
}

export default App;
