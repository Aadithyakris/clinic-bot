// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BookingForm from './components/BookingForm';
import AdminPanel from './AdminPanel';

function App() {
  return (
    <Router>
      <Routes>
        {/* Patient Booking Page */}
        <Route path="/book" element={<BookingForm />} />

        {/* Admin Panel Routes */}
        <Route path="/*" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
