// Full WhatsApp booking & cancellation flow
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const twilio = require('twilio');
const userSessions = new Map();
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize Firebase
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// Utility
function isAtLeast6HoursBefore(dateStr, timeStr) {
  const [hourMin, ampm] = timeStr.split(' ');
  let [hour, minute] = hourMin.split(':').map(Number);
  if (ampm.toLowerCase() === 'pm' && hour !== 12) hour += 12;
  if (ampm.toLowerCase() === 'am' && hour === 12) hour = 0;
  const slotDateTime = new Date(`${dateStr}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`);
  return (slotDateTime - new Date()) / (1000 * 60 * 60) >= 6;
}

// Twilio Config
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// WhatsApp Webhook

app.get('/api/slots', async (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ error: 'Missing required parameter: date' });
  }

  try {
    const snapshot = await db.collection('slots')
      .where('date', '==', date)
      .where('isBooked', '==', false)
      .get();

    const slots = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(slots);
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
});

app.post('/api/slots/generate', async (req, res) => {
  const { date, startTime, endTime, numberOfSlots } = req.body;

  if (!date || !startTime || !endTime || !numberOfSlots) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  function convertToMinutes(timeStr) {
    const [hourMin, ampm] = timeStr.split(' ');
    let [hour, min] = hourMin.split(':').map(Number);
    if (ampm.toLowerCase() === 'pm' && hour !== 12) hour += 12;
    if (ampm.toLowerCase() === 'am' && hour === 12) hour = 0;
    return hour * 60 + min;
  }

  function convertToTimeStr(minutes) {
    const hour24 = Math.floor(minutes / 60);
    const min = minutes % 60;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    let hour12 = hour24 % 12;
    if (hour12 === 0) hour12 = 12;
    return `${hour12.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')} ${ampm}`;
  }

  try {
    const startMin = convertToMinutes(startTime);
    const endMin = convertToMinutes(endTime);
    const totalDuration = endMin - startMin;

    if (totalDuration <= 0) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    const slotDuration = Math.floor(totalDuration / numberOfSlots);
    const batch = db.batch();

    for (let i = 0; i < numberOfSlots; i++) {
      const slotStartMin = startMin + i * slotDuration;
      const slotTime = convertToTimeStr(slotStartMin);
      const slotRef = db.collection('slots').doc();

      batch.set(slotRef, {
        date,
        time: slotTime,
        isBooked: false,
        patientId: null,
      });
    }

    await batch.commit();
    res.status(201).json({ message: 'Slots generated successfully' });
  } catch (error) {
    console.error('Error generating slots:', error);
    res.status(500).json({ error: 'Failed to generate slots' });
  }
});

app.get('/api/booked-slots', async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: 'Missing required parameter: date' });
  }

  try {
    const patientsSnapshot = await db.collection('patients')
      .where('date', '==', date)
      .get();

    const bookedSlots = [];

    for (const doc of patientsSnapshot.docs) {
      const data = doc.data();

      // Get time from slots collection
      const slotDoc = await db.collection('slots').doc(data.slotId).get();

      if (slotDoc.exists) {
        const slotData = slotDoc.data();

        bookedSlots.push({
          id: doc.id,
          name: data.name,
          age: data.age,
          contact: data.contact,
          time: slotData.time,
        });
      }
    }

    // Sort by time
    bookedSlots.sort((a, b) => {
      const parseTime = t => {
        const [time, ampm] = t.split(' ');
        let [hr, min] = time.split(':').map(Number);
        if (ampm === 'PM' && hr !== 12) hr += 12;
        if (ampm === 'AM' && hr === 12) hr = 0;
        return hr * 60 + min;
      };
      return parseTime(a.time) - parseTime(b.time);
    });

    res.json(bookedSlots);
  } catch (error) {
    console.error('Error fetching booked slots:', error);
    res.status(500).json({ error: 'Failed to fetch booked slots' });
  }
});


app.post('/webhook', async (req, res) => {
  const twiml = new twilio.twiml.MessagingResponse();
  const incomingMsg = req.body.Body.trim();
  const from = req.body.From;

  let session = userSessions.get(from);
  if (!session) {
    session = { step: 'initial' };
    userSessions.set(from, session);
  }

  try {
    // Book flow
    if (incomingMsg === '1' && session.step === 'initial') {
      twiml.message('🗓 Please enter the date (YYYY-MM-DD) you want to book an appointment for:');
      session.step = 'awaiting_date';
    } else if (session.step === 'awaiting_date' && /^\d{4}-\d{2}-\d{2}$/.test(incomingMsg)) {
      const date = incomingMsg;
      const snapshot = await db.collection('slots')
        .where('date', '==', date)
        .where('isBooked', '==', false)
        .get();

      if (snapshot.empty) {
        twiml.message(`❌ No available slots on ${date}. Try a different date.`);
      } else {
        const slots = snapshot.docs.map(doc => ({ id: doc.id, time: doc.data().time, date: doc.data().date }));
        session.availableSlots = slots;
        session.date = date;
        session.step = 'awaiting_slot_choice';

        let msg = `🗓 Available slots for *${date}*:\n\n`;
        slots.forEach((slot, i) => {
          msg += `• ${i + 1}. ${slot.time}\n`;
        });
        msg += `\n💬 Reply with the number (1, 2, ...) of your preferred slot.`;
        twiml.message(msg);
      }
    } else if (session.step === 'awaiting_slot_choice' && /^\d+$/.test(incomingMsg)) {
      const index = parseInt(incomingMsg, 10) - 1;
      const selectedSlot = session.availableSlots?.[index];

      if (!selectedSlot) {
        twiml.message('❌ Invalid choice. Please reply with a valid slot number.');
      } else {
        session.selectedSlotId = selectedSlot.id;
        session.step = 'awaiting_name';
        twiml.message('👤 Please enter your *full name* to continue booking:');
      }
    } else if (session.step === 'awaiting_name') {
      session.name = incomingMsg;
      session.step = 'awaiting_age';
      twiml.message('🎂 Please enter your *age* (number only):');
    } else if (session.step === 'awaiting_age') {
      if (!/^\d+$/.test(incomingMsg)) {
        twiml.message('❌ Please enter a valid number for age.');
      } else {
        session.age = incomingMsg;
        session.step = 'awaiting_contact';
        twiml.message('📞 Please enter your *contact number* (10 digits):');
      }
    // } else if (session.step === 'awaiting_contact') {
    //   session.contact = incomingMsg;
    //   const slotRef = db.collection('slots').doc(session.selectedSlotId);
    //   const slotDoc = await slotRef.get();

    //   if (!slotDoc.exists || slotDoc.data().isBooked) {
    //     twiml.message('❌ The selected slot is no longer available. Please start again.');
    //     session.step = 'initial';
    //   } else {
    //     const patientRef = await db.collection('patients').add({
    //       name: session.name,
    //       contact: session.contact,
    //       age: session.age,
    //       bookedAt: new Date(),
    //       slotId: session.selectedSlotId,
    //     });

    //     await slotRef.update({ isBooked: true, patientId: patientRef.id });

    //     twiml.message(`✅ Appointment booked for *${slotDoc.data().time}* on *${slotDoc.data().date}*. Thank you!`);
    //     userSessions.delete(from);
    //   }
    // }
    } else if (session.step === 'awaiting_contact') {
  session.contact = incomingMsg;
  const slotRef = db.collection('slots').doc(session.selectedSlotId);
  const slotDoc = await slotRef.get();

  if (!slotDoc.exists || slotDoc.data().isBooked) {
    twiml.message('❌ The selected slot is no longer available. Please start again.');
    session.step = 'initial';
  } else {
    const patientRef = await db.collection('patients').add({
      name: session.name,
      contact: session.contact,
      age: session.age,
      bookedAt: new Date(),
      slotId: session.selectedSlotId,
      date: slotDoc.data().date // ✅ Add this to enable filtering by date
    });

    await slotRef.update({ isBooked: true, patientId: patientRef.id });

    twiml.message(`✅ Appointment booked for *${slotDoc.data().time}* on *${slotDoc.data().date}*. Thank you!`);
    userSessions.delete(from);
  }
}


    // Cancel flow
    else if (incomingMsg === '2' && session.step === 'initial') {
      twiml.message('❌ Please enter your *Patient ID* to cancel your appointment:');
      session.step = 'awaiting_cancel_id';
    } else if (session.step === 'awaiting_cancel_id') {
      const patientId = incomingMsg;
      const patientRef = db.collection('patients').doc(patientId);
      const patientDoc = await patientRef.get();

      if (!patientDoc.exists) {
        twiml.message('❌ No appointment found with that Patient ID.');
      } else {
        const slotId = patientDoc.data().slotId;
        const slotRef = db.collection('slots').doc(slotId);
        const slotDoc = await slotRef.get();
        const slot = slotDoc.data();

        if (!isAtLeast6HoursBefore(slot.date, slot.time)) {
          twiml.message('⚠️ You can only cancel *at least 6 hours* before the appointment.');
        } else {
          await slotRef.update({ isBooked: false, patientId: null });
          await patientRef.delete();
          twiml.message(`✅ Appointment for *${slot.time}* on *${slot.date}* has been cancelled.`);
        }
      }
      session.step = 'initial';
    }

    // Default or reset
    else {
      twiml.message(
        `👋 Welcome to the Clinic Bot!\n\nReply with:\n1️⃣ Book Appointment\n2️⃣ Cancel Appointment`
      );
      session.step = 'initial';
    }

    userSessions.set(from, session);
    res.set('Content-Type', 'text/xml');
    res.send(twiml.toString());
  } catch (err) {
    console.error('❌ Webhook error:', err);
    twiml.message('⚠️ Something went wrong. Please try again.');
    res.set('Content-Type', 'text/xml');
    res.send(twiml.toString());
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
