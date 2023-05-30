const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./models/User')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const imageDownloader = require('image-downloader')
require('dotenv').config();
const app = express();

// password incription -----------------------------------
const bcryptSalt = bcrypt.genSaltSync(10);
// jwt token incription --------------------------------
const jwtSecret = 'sdjhdgsfuysgfiwewfh';


app.use(express.json());
app.use(cookieParser())
app.use('/uploads', express.static(__dirname + '/uploads'))



app.use(cors({ 
    credentials:true,
    origin: 'http://127.0.0.1:5173' }));


mongoose.connect(process.env.MONGO_URL);

app.get('/test', (req,res)=>{
   
    res.json('test ok')
   
});


// register user 1-----------------------------------
// ---------------------------------

app.post('/register', async (req,res) =>{
    const {name, email, password} = req.body;

    try{
        const userDoc = await User.create({
            name,
            email,
            password:bcrypt.hashSync(password, bcryptSalt),
        })
        res.json(userDoc)
    } catch(e){
        res.status(422).json(e)
    }
    })

// login user 2----------------------------------------
// -----------------------------------------

    app.post('/login',async (req,res)=>{
        const {email,password}= req.body;
        const userDoc= await User.findOne({email});
        if(userDoc){
           const passOk = bcrypt.compareSync(password, userDoc.password)
           if(passOk){
            jwt.sign({
                email:userDoc.email, 
                id:userDoc._id,
            }, jwtSecret, {}, (err, token)=>{
                if(err) throw err;
                res.cookie('token', token).json(userDoc);
            })
           }
           else{
            res.status(422).json('not ok')
           }
        }
        else{
            res.json('not')
        }
    })


    // user profile 3---------------------------------------------------
    // --------------------------------------

    app.get('/profile',  (req, res) =>{
        const {token} = req.cookies;
        if(token){
            jwt.verify(token, jwtSecret, {},async (err, userData)=>{
                if(err) throw err;
                const {name,email, _id} = await User.findById(userData.id)
                res.json({name, email, _id});
            })
        }
        else{
            res.json(null);
        }
    })




    // user logout 4---------------------------------------------------
    // --------------------------------------

    app.post('/logout', (req, res) =>{
        res.cookie('token', '').json(true);
    })


    app.post('/upload-by-link', async (req,res) =>{
        const {link} = req.body;
        const newName = 'photo' + Date.now() + '.jpg';
        await imageDownloader.image({
            url:link,
            dest: __dirname+'/uploads/' + newName, 
        });
        res.json(newName, )
    })

app.listen(4000, () => {
    console.log('Server is running on port 4000');
  });