import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Settings from './pages/Settings';
import ReceiptForm from './pages/ReceiptForm';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/receipt/add" element={<ReceiptForm />} />
        <Route path="/receipt/edit/:id" element={<ReceiptForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;