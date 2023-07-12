const express = require("express");
const errorHandler = require('./middlewares/errorHandler');
const connectDB = require("./db/connect");
const branchRoutes = require('./routes/branchRoutes');
const subRoutes = require('./routes/subRoutes');
const modRoutes = require('./routes/modRoutes');
const userRoutes = require('./routes/userRoutes');
const noteRoutes = require('./routes/noteRoutes');
const cors = require('cors');
require('dotenv').config();



const app = express();

const port = process.env.PORT || 5000;
app.use(express.json());
app.use(cors())
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

app.use('/api/v1/branch', branchRoutes);
app.use('/api/v1/sub', subRoutes);
app.use('/api/v1/mod', modRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/notes', noteRoutes);
app.use(errorHandler);
start();

