import AppRoutes from './routes/Route';
import { BrowserRouter } from "react-router";
import { AuthProvider } from './contexts/AuthContext'; 
import { ToastContainer} from 'react-toastify';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
function App() {
  // Create a client
const queryClient = new QueryClient({
  // Optional: Default options for all queries/mutations
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data is considered fresh for 5 minutes
      // refetchOnWindowFocus: false, // Optional: Disable refetching on window focus
    },
  },
});
  return (
    <AuthProvider>
      <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AppRoutes/>
      </QueryClientProvider>
      </BrowserRouter>
      <ToastContainer position="bottom-right" autoClose={3500} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </AuthProvider>
  );
}

export default App;
