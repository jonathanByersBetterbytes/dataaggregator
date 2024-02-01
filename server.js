const express = require("express");
const app = express();
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const methodOverride = require("method-override");
const flash = require("express-flash");
const logger = require("morgan");

const pdf2excel = require("pdf-to-excel");
const XLSX = require('xlsx')
let fs = require('fs'), PDFParser = require("pdf2json");




const connectDB = require("./config/database");
const mainRoutes = require("./routes/main");
const postRoutes = require("./routes/posts");

//Use .env file in config folder
require("dotenv").config({ path: "./config/.env" });

// Passport config
require("./config/passport")(passport);

//Connect To Database
connectDB();

//Using EJS for views
app.set("view engine", "ejs");

//Static Folder
app.use(express.static("public"));

//Body Parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Logging
app.use(logger("dev"));

//Use forms for put / delete
app.use(methodOverride("_method"));

// Setup Sessions - stored in MongoDB
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Use flash messages for errors, info, ect...
app.use(flash());

//Setup Routes For Which The Server Is Listening
app.use("/", mainRoutes);
app.use("/post", postRoutes);


//Server Running
app.listen(process.env.PORT, () => {
  console.log("Server is running, you better catch it!");

  pdfExcel()
  //processExcel()
  //pdfToJson()
});

async function pdfExcel() {
  try {
    await pdf2excel.genXlsx('2023.01.27AmexBus.pdf', '2023.01.27AmexBus.xlsx');
    console.log("Generated Excel2!");
  } catch (err) {
    console.error(err);
  }
}
let pdfParser = new PDFParser(this, 1);
//pdfToJson()
function pdfToJson() {
  pdfParser.on("pdfParser_dataError", (errData) =>
    console.error(errData.parserError)
  );
  pdfParser.on("pdfParser_dataReady", (pdfData) => {
    console.log('received pdf')
    fs.writeFile(
      "parsed.json",
      //JSON.stringify(pdfData),
      pdfParser.getRawTextContent(),
      function (err, result) {
        console.log(err);
      }
    );
    console.log(JSON.parse(pdfParser.getRawTextContent()))
    console.log('generated json file')
  });
  pdfParser.loadPDF("statement.pdf")
}

function processExcel (){
  //const workbook = XLSX.readFile('bar2.xlsx')
  const workbook = XLSX.readFile('scores.xlsx')
  const worksheet = workbook.Sheets['Sheet1']

  const jsonStmt = XLSX.utils.sheet_to_json(worksheet)
  console.log(jsonStmt) 
  // const range = XLSX.utils.decode_range(worksheet['!ref'])

  // // loop over every row/student
  // for(let rowNum = range.s.r; rowNum <= range.e.r; rowNum++){
  //   const highSchool = worksheet[XLSX.utils.encode_cell({ r: rowNum, c: 1 })].v

  //   if( highSchool === 'Lead Paint HS') 
  //     worksheet[XLSX.utils.encode_cell({ r: rowNum, c: 3})].v += 30
  // }
  // const newWb = XLSX.utils.book_new()
  // XLSX.utils.book_append_sheet(newWb, worksheet, 'Sheet1')
  // XLSX.writeFile(newWb, 'scoresWithCurve.xlsx')
  // console.log(jsonStmt) 
}