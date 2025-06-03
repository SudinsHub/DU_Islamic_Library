import AppRoutes from './routes/Route';
import { BrowserRouter } from "react-router";
import { AuthProvider } from './contexts/AuthContext'; 
import { ToastContainer} from 'react-toastify';
function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes/>
      </BrowserRouter>
      <ToastContainer position="bottom-right" autoClose={3500} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </AuthProvider>
  );
}

export default App;
