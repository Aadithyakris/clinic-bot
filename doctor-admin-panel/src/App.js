import React from 'react';
import SlotForm from './components/SlotForm';
import SlotList from './components/SlotList'; // optional, if already exists

function App() {
  return (
    <div>
      <h1>Doctor Admin Panel</h1>
      <SlotForm />
      <hr />
      <SlotList /> {/* optional: to view available slots */}
    </div>
  );
}

export default App;
