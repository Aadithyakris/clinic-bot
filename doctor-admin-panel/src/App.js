import React from 'react';
import SlotForm from './components/SlotForm';
import SlotList from './components/SlotList'; // optional
import BookedSlots from './components/BookedSlots'; // ✅ import the new component

function App() {
  return (
    <div>
      <h1>Doctor Admin Panel</h1>
      <SlotForm />
      <hr />
      <SlotList /> {/* optional: to view available slots */}
      <hr />
      <BookedSlots /> {/* ✅ added to show booked slots */}
    </div>
  );
}

export default App;
