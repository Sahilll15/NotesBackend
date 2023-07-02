const express = require("express");
const errorHandler = require('./middlewares/errorHandler');
const connectDB = require("./db/connect");
const branchRoutes = require('./routes/branchRoutes');
require('dotenv').config();

const app = express();

const port = process.env.PORT || 5000;
app.use(express.json());
const start = async () => {
    try{
        await connectDB(process.env.MONGO_URI);
        app.listen(port,()=>{
            console.log(`Server started on ${port}`)
        });
    }catch(err){
        console.log(err);
    }
};
app.use('/api/v1/branch', branchRoutes);
app.use(errorHandler);
start();

