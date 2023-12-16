

// const cors = require('cors')
const express = require("express")
const cors = require('cors')
const morgan = require('morgan')
const credentials = require('./middi/credentials.js');
const corsOptions = require('./config/corsOptions.js');
const fileUpload = require('express-fileupload');
const cloudinary = require("cloudinary").v2;
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// app.use()
app.use(credentials);
app.use(cors(corsOptions));

app.use(fileUpload({
  useTempFiles: true
}))

app.use(cors({
  origin: [
    "https://ssu-admin.vercel.app",
    "https://ssu-8uh2.vercel.app",
    "http://localhost:3000"
  ]
}))
// "http://localhost:3000"
app.use(morgan('tiny'));


cloudinary.config({
  cloud_name: "decjoyrmj",
  api_key: "627647724186355",
  api_secret: "mw_DjfFMzfZ2pKOWv1hNyuP8T0A"
});


const studentRouter = require("./route/userRouter")
const preferencesRoute = require("./route/preferencesRoute.js")
const adminPref = require("./route/adminPrefer")

app.use("/admin", adminPref)

app.use("/student", studentRouter)

app.use("/student", preferencesRoute)

module.exports = app



