const express=require('express');
const fs=require('fs');
const path=require('path');
const app=express();
const PORT=process.env.PORT||3000;
const DATA_DIR=path.join(__dirname,'data');
const DATA_FILE=path.join(DATA_DIR,'records.json');
fs.mkdirSync(DATA_DIR,{recursive:true});
if(!fs.existsSync(DATA_FILE))fs.writeFileSync(DATA_FILE,JSON.stringify({reservations:[],support:[],reviews:[]},null,2));
app.use(express.json({limit:'30kb'}));
app.use(express.static(path.join(__dirname,'public')));
function read(){try{return JSON.parse(fs.readFileSync(DATA_FILE,'utf8'))}catch{return {reservations:[],support:[],reviews:[]}}}
function write(data){fs.writeFileSync(DATA_FILE,JSON.stringify(data,null,2))}
function clean(v,max=2000){return String(v??'').trim().slice(0,max)}
function validEmail(v){return !v||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)}
app.get('/api/reviews',(req,res)=>{const data=read();res.json({reviews:data.reviews.slice(-30).reverse()})});
app.post('/api/reservations',(req,res)=>{const b=req.body||{};const record={name:clean(b.name,100),phone:clean(b.phone,25),email:clean(b.email,150),guests:clean(b.guests,10),date:clean(b.date,10),time:clean(b.time,20),notes:clean(b.notes,1000),createdAt:new Date().toISOString(),status:'pending'};
if(!record.name||!record.phone||!record.date||!record.time||!record.guests)return res.status(400).json({error:'Please complete all required reservation fields.'});
if(!validEmail(record.email))return res.status(400).json({error:'Please enter a valid email address.'});
if(!/^\d{4}-\d{2}-\d{2}$/.test(record.date)||record.date<new Date().toISOString().slice(0,10))return res.status(400).json({error:'Please choose today or a future date.'});
const data=read();data.reservations.push(record);write(data);res.status(201).json({message:'Reservation request received. Our team will contact you to confirm.'})});
app.post('/api/support',(req,res)=>{const b=req.body||{};const record={name:clean(b.name,100),contact:clean(b.contact,150),topic:clean(b.topic,100),message:clean(b.message,2000),createdAt:new Date().toISOString(),status:'new'};
if(!record.name||!record.contact||!record.topic||record.message.length<5)return res.status(400).json({error:'Please complete all required support fields.'});
const data=read();data.support.push(record);write(data);res.status(201).json({message:'Thanks! Your message has been saved.'})});
app.post('/api/reviews',(req,res)=>{const b=req.body||{};const rating=Number(b.rating);const record={name:clean(b.name,100),rating,comment:clean(b.comment,1500),createdAt:new Date().toISOString()};
if(!record.name||!Number.isInteger(rating)||rating<1||rating>5||record.comment.length<8)return res.status(400).json({error:'Please provide your name, a rating, and a review of at least 8 characters.'});
const data=read();data.reviews.push(record);write(data);res.status(201).json({message:'Thank you for sharing your experience!'})});
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(PORT,()=>console.log(`Pimlico website running at http://localhost:${PORT}`));
