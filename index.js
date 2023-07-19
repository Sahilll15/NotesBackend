const express = require("express");
const errorHandler = require('./middlewares/errorHandler');
const connectDB = require("./db/connect");
const branchRoutes = require('./routes/branchRoutes');
const subRoutes = require('./routes/subRoutes');
const modRoutes = require('./routes/modRoutes');
const userRoutes = require('./routes/userRoutes');
const bodyParser = require('body-parser');
const noteRoutes = require('./routes/noteRoutes');
const cors = require('cors');
require('dotenv').config();



const app = express();

const port = process.env.PORT || 8000;
app.use(express.json());
app.use(cors())
app.use(bodyParser.json())
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(port, () => {
            console.log(`Server started on ${port}`)
        });
    } catch (err) {
        console.log(err);
    }
};

// app.get('/api/v1/users/emailverify/:tokenId', (req, res) => {

//     const congratulationContent = `
//       <h1 style="color: #008080; font-family: 'Arial', sans-serif; text-align: center;">Congratulations!</h1>
//       <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px;">
//         <p style="font-size: 16px; font-family: 'Arial', sans-serif; color: #444; text-align: center;">You have successfully verified your email.</p>
//         <div style="text-align: center; margin-top: 20px;">
//           <a href="http://localhost:3000/login" style="display: inline-block; background-color: #008080; color: #fff; font-size: 18px; font-family: 'Arial', sans-serif; text-decoration: none; padding: 10px 20px; border-radius: 5px; border: 2px solid #008080; transition: background-color 0.3s ease-in-out;">
//             Go to Home Page
//           </a>
//         </div>
//       </div>
//     `;


//     res.send(congratulationContent);
// });

app.use('/api/v1/branch', branchRoutes);
app.use('/api/v1/sub', subRoutes);
app.use('/api/v1/mod', modRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/notes', noteRoutes);
app.use(errorHandler);
start();

