import AppRoutes from './routes/Route';
import { BrowserRouter } from "react-router";

function App() {

  return (
    <BrowserRouter>
      <AppRoutes/>
    </BrowserRouter>
  );
}

export default App;
