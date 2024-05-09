import logo from './logo.svg';
import './App.css';
import { Routes, Route, BrowserRouter } from "react-router-dom"
import Farm from "./pages/farm"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClusterProvider } from './cluster/cluster-data-access';
import { SolanaProvider } from './solana/solana-provider';
import toast, { Toaster } from 'react-hot-toast';
const client = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={client}>
      <ClusterProvider>
        <SolanaProvider>
        <div className="App">
          <BrowserRouter>
            <Routes>
                <Route path="/" element={<Farm />} />
            </Routes>
          </BrowserRouter>
          <Toaster position="bottom-right" />
        </div>
        </SolanaProvider>
    </ClusterProvider>
   </QueryClientProvider>
  );
}

export default App;
