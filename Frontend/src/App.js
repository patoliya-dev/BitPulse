import './App.css';
import Header from './components/Header';
import AppRoutes from './routes/AppRoutes';
import { ToastContainer } from "react-toastify";
import { useLocation } from 'react-router-dom';
import "react-toastify/dist/ReactToastify.css";

function App() {
  const location = useLocation();
  const hideHeaderRoutes = ['/login', '/register']; // routes without header

  const showHeader = !hideHeaderRoutes.includes(location.pathname);

  return (
    <div>
      {showHeader && <Header />}
      <AppRoutes />
      <ToastContainer
        position="top-right"
        autoClose={3000} // 3 seconds
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored" // light, dark, colored
      />
    </div>
  );
}

export default App;
