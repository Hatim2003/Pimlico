const express=require('express');
const fs=require('fs');
const path=require('path');
const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;
  
console.log('Email config present:', {
  apiKey: Boolean(process.env.RESEND_API_KEY),
  clientEmail: Boolean(process.env.CLIENT_EMAIL),
  fromEmail: Boolean(process.env.FROM_EMAIL)
});
const app=express();
const PORT=process.env.PORT||3000;
const DATA_DIR=path.join(__dirname,'data');
const DATA_FILE=path.join(DATA_DIR,'records.json');
fs.mkdirSync(DATA_DIR,{recursive:true});
if(!fs.existsSync(DATA_FILE))fs.writeFileSync(DATA_FILE,JSON.stringify({reservations:[],support:[],reviews:[]},null,2));
// Allow the public GitHub Pages website to call this backend.
const allowedOrigins = new Set([
  'https://hatim2003.github.io'
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  // Handle browser CORS preflight requests.
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json({ limit: '30kb' }));
app.use(express.static(path.join(__dirname, 'public')));
function read(){try{return JSON.parse(fs.readFileSync(DATA_FILE,'utf8'))}catch{return {reservations:[],support:[],reviews:[]}}}
function write(data){fs.writeFileSync(DATA_FILE,JSON.stringify(data,null,2))}
function clean(v,max=2000){return String(v??'').trim().slice(0,max)}
function validEmail(v){return !v||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)}
async function sendClientEmail(subject, details) {
  if (!resend || !process.env.CLIENT_EMAIL || !process.env.FROM_EMAIL) {
    console.warn('Email notification skipped: email configuration is incomplete.');
    return;
  }

  try {
    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: [process.env.CLIENT_EMAIL],
      subject,
      text: details
    });

    if (result.error) {
      console.error('Email notification failed:', result.error.message);
    } else {
      console.log('Email notification sent:', subject);
    }
  } catch (err) {
    console.error('Email notification failed:', err.message);
  }
}
app.get('/api/reviews',(req,res)=>{const data=read();res.json({reviews:data.reviews.slice(-30).reverse()})});
app.post('/api/reservations',(req,res)=>{const b=req.body||{};const record={name:clean(b.name,100),phone:clean(b.phone,25),email:clean(b.email,150),guests:clean(b.guests,10),date:clean(b.date,10),time:clean(b.time,20),notes:clean(b.notes,1000),createdAt:new Date().toISOString(),status:'pending'};
if(!record.name||!record.phone||!record.date||!record.time||!record.guests)return res.status(400).json({error:'Please complete all required reservation fields.'});
if(!validEmail(record.email))return res.status(400).json({error:'Please enter a valid email address.'});
if(!/^\d{4}-\d{2}-\d{2}$/.test(record.date)||record.date<new Date().toISOString().slice(0,10))return res.status(400).json({error:'Please choose today or a future date.'});
const data=read();
data.reservations.push(record);
write(data);

sendClientEmail(
  'New Pimlico Reservation Request',
  `A new reservation request has been received.

Name: ${record.name}
Phone: ${record.phone}
Email: ${record.email || 'Not provided'}
Guests: ${record.guests}
Date: ${record.date}
Time: ${record.time}
Notes: ${record.notes || 'None'}
Received: ${record.createdAt}
Status: ${record.status}`
);

res.status(201).json({
  message: 'Reservation request received. Our team will contact you to confirm.'
});
});
app.post('/api/support',(req,res)=>{const b=req.body||{};const record={name:clean(b.name,100),contact:clean(b.contact,150),topic:clean(b.topic,100),message:clean(b.message,2000),createdAt:new Date().toISOString(),status:'new'};
if(!record.name||!record.contact||!record.topic||record.message.length<5)return res.status(400).json({error:'Please complete all required support fields.'});
const data=read();
data.support.push(record);
write(data);

sendClientEmail(
  'New Pimlico Support Message',
  `A new support message has been received.

Name: ${record.name}
Contact: ${record.contact}
Topic: ${record.topic}
Message: ${record.message}
Received: ${record.createdAt}
Status: ${record.status}`
);

res.status(201).json({
  message: 'Thanks! Your message has been saved.'
});
});
app.post('/api/reviews',(req,res)=>{const b=req.body||{};const rating=Number(b.rating);const record={name:clean(b.name,100),rating,comment:clean(b.comment,1500),createdAt:new Date().toISOString()};
if(!record.name||!Number.isInteger(rating)||rating<1||rating>5||record.comment.length<8)return res.status(400).json({error:'Please provide your name, a rating, and a review of at least 8 characters.'});
const data=read();
data.reviews.push(record);
write(data);

sendClientEmail(
  'New Pimlico Customer Review',
  `A new customer review has been received.

Name: ${record.name}
Rating: ${record.rating}/5
Review: ${record.comment}
Received: ${record.createdAt}`
);

res.status(201).json({
  message: 'Thank you for sharing your experience!'
});
});
// Unknown API endpoints should return JSON, not the website HTML.
app.use('/api', (req, res) => res.status(404).json({
  error: 'API endpoint not found. Make sure the Pimlico Node.js server is running.'
}));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Pimlico website running at http://localhost:${PORT}`);
});