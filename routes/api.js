var express = require("express");
var router = express.Router();
var parse = require("csv-parse");
var fs = require("fs");
const multer = require("multer");
const path = require("path");
// TODO code routes to handle each crypto
// TODO create route to show all the crypto available in dataset

const csvDataBTC = [];
fs.createReadStream("./public/assets/coin_Bitcoin.csv")
  .pipe(
    parse({
      delimiter: ",",
      columns: true,
    })
  )
  .on("data", (dataRow) => {
    csvDataBTC.push(dataRow);
  })
  .on("end", () => {
    console.log(csvDataBTC[0]);
  });

/* File uploads */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  // By default, multer removes file extensions so let's add them back
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

router.post("/upload", (req, res) => {
  // 'profile_pic' is the name of our file input field in the HTML form
  let file = req.files.uploadfile;
  file.mv("./public/assets/coin_" + file.name);
  res.json({
    message: "200",
  });
});
/* Get Filenames */
router.get("/filenames", function (req, res, next) {
  fs.readdir("./public/assets/", (err, files) => {
    let filenames = [];
    files.forEach((file) => {
      file = file.slice(5, -4);
      filenames.push(file);
      console.log(file);
    });
    let handledData = [];
    filenames.map((file) => {
      handledData.push(`coin_${file}.csv`);
    });
    res.json({
      message: "200",
      data: filenames,
      handeledData: handledData,
    });
  });
});
/* GET CSV Data. */
router.get("/cryptodata", function (req, res, next) {
  const filename = req.query.coin;
  let tmpdata = [];
  fs.createReadStream(`./public/assets/coin_${filename}.csv`).pipe(
    parse({
      delimiter: ",",
      columns: true,
    })
      .on("data", (dataRow) => {
        tmpdata.push(dataRow);
      })
      .on("end", () => {
        const query = req.query;
        let startDate = new Date(query.startdate);
        let endDate = new Date(
          startDate.getFullYear() + 1,
          startDate.getMonth(),
          startDate.getDate() + 1
        );
        const filteredData = tmpdata.filter((csvRow) => {
          let rowDate = new Date(csvRow["Date"]);
          if (rowDate > startDate && rowDate < endDate) {
            return csvRow;
          }
        });
        //profit calculation
        let units = query.units ? parseFloat(query.units) : 1.0;
        let profit =
          units *
          (parseFloat(filteredData.slice(-1)[0]["Close"]) -
            parseFloat(filteredData[0]["Close"]));
        let cost = parseFloat(filteredData[0]["Close"]) * units;
        let sale = parseFloat(filteredData.slice(-1)[0]["Close"]) * units;
        res.json({
          message: "200",
          rawData: filteredData,
          handeledData: {
            length: filteredData.length,
            start: filteredData[0],
            end: filteredData.slice(-1)[0],
            profit: profit,
            cost: cost.toFixed(2),
            sale: sale.toFixed(2),
          },
          query: query,
        });
      })
  );
});

module.exports = router;
