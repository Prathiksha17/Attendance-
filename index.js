const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Signup = require('./models/signupSchema');
const Attendance = require('./models/AttendenceScahema');
const Login = require('./models/loginSchema');
const bcrypt = require('bcrypt');
const cors=require('cors');
const jwt = require('jsonwebtoken');
const app = express();
dotenv.config();
app.use(cors())
app.use(express.json());
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MongoDB Connection Successful");
    })
    .catch((err) => {
        console.error("MongoDB Connection Unsuccessful:", err.message);
    });
const verifyToken = (req, res, next) => {
    console.log("middlaeware called");
    var token = req.headers.authorization;
    if(!token) res.send("Access Denied");
try{
   const user=jwt.verify(token,process.env.SECRET_KEY);
   console.log(user);
   req.user=user;
}
catch(err){
    console.log(err);
    res.send("Error in token");
}
    next();
}
app.get('/', (req, res) => {
    res.send("this is the backend for students attedence tracker"
    );
});
app.get('/json', verifyToken,(req, res) => {
res.json({
    message: "This is the middleware",
    user: req.user})
})
app.post('/signup', async (req, res) => {
    const { firstName, lastName, userName, email, password } = req.body;
    var hashedpassword= await bcrypt.hash(password, 10);
    // console.log(hashedpassword);
    try {
        const newSignup = new Signup({
            firstName:firstName,
            lastName:lastName,
            userName:userName,
           email: email,
           password: hashedpassword
        });

        await newSignup.save();
        res.status(201).send("SignUp Successful");
    } catch (err) {
        res.status(400).send({ message: "SignUp Unsuccessful", error: err.message });
    }
});
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await Signup.findOne({ email });
        if (user) {
            const payload = {
                email: user.email
            }
            const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h' });
            console.log('Token:', token);
            var isPasswordCorrect = await bcrypt.compare(password, user.password)
            if (isPasswordCorrect) {
                res.status(200).send({ message: "Login Successful", token: token });
            } else {
                res.status(401).send({ message: "Invalid password" });
            }
        } else {
            res.status(401).send({ message: "User not found please signup!" });
        }
    } catch (err) {
        res.status(500).send({ message: "Error during login" });
    }
});
app.get('/getsignupdet', async (req, res) => {
    try {
        const signUpdet = await Signup.find();
        res.status(200).json(signUpdet);
    } catch (err) {
        res.status(500).send({ message: "Error Fetching Data", error: err.message });
    }
});

app.post("/submit", async (req, res) => {
    try {
        const { students } = req.body;
        const currentDate = new Date();
        const date = currentDate.toLocaleDateString();
        const time = currentDate.toLocaleTimeString();
        for (let student of students) {
            const attendance = new Attendance({
                name: student.name,
                status: student.status,
                date: date,
                time: time
            });

            await attendance.save();
        }
        res.status(200).send("Attendance submitted successfully");
    } catch (err) {
        console.log(err);
        res.status(500).send("Error in submitting attendance");
    }
})
app.get("/attendance", async (req, res) => {
    try {
        const records = await Attendance.find();
        res.status(200).json(records);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error fetching attendance");
    }
});
app.listen(3000, () => {
    console.log("Server Started on Port 3001");
});