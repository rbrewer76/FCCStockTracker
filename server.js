'use strict';

const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const helmet = require("helmet")
const mongo = require("mongodb")
const mongoose = require("mongoose")

const apiRoutes = require("./routes/api.js")
const fccTestingRoutes = require("./routes/fcctesting.js")
const runner = require("./test-runner")

const app = express()

const port = process.env.PORT || 3000
const client = mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true ,  useUnifiedTopology: true })
mongoose.set('useFindAndModify', false)

/*
// is there a connection to the DB?
setTimeout(() => {
  console.log("mongoose connected: " + mongoose.connection.readyState)}, 2000)
*/

app.use('/public', express.static(process.cwd() + '/public'))

app.use(cors({origin: '*'}));//For FCC testing purposes only

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use(helmet.noSniff())
app.use(helmet.xssFilter())
app.use(helmet.noCache())
app.use(helmet.hidePoweredBy({setTo: "PHP 4.2.0"}))
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'"]
  }
}))

//Index page (static HTML)
app.route("/")
  .get((req, res) => {
    res.sendFile(process.cwd() + "/views/index.html")
  })

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app);  
    
//404 Not Found Middleware
app.use((req, res, next) => {
  res.status(404)
    .type("text")
    .send("Not Found")
})

//Start our server and tests!
app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port " + process.env.PORT)
  if(process.env.NODE_ENV==="test") {
    console.log("Running Tests...")
    setTimeout(() => {
      try {
        runner.run()
      } 
      catch(error) {
        console.log("Tests are not valid:")
        console.log(error)
      }
    }, 3500)
  }
})

module.exports = app; //for testing
