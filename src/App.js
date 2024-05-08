import logo from './logo.svg';
import './App.css';
import { Routes, Route, BrowserRouter } from "react-router-dom"
import Farm from "./pages/farm"
function App() {
  return (
    <div className="App">
     <BrowserRouter>
       <Routes>
          <Route path="/" element={<Farm />} />
       </Routes>
     </BrowserRouter>
   </div>
  );
}

export default App;
