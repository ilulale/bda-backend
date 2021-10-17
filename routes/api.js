var express = require("express");
var router = express.Router();
var parse = require("csv-parse");
var fs = require("fs");

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

/* GET CSV Data. */
router.get("/cryptodata", function (req, res, next) {
  const query = req.query;
  let startDate = new Date(query.startdate);
  let endDate = new Date(
    startDate.getFullYear() + 1,
    startDate.getMonth(),
    startDate.getDate() + 1
  );
  const filteredData = csvDataBTC.filter((csvRow) => {
    let rowDate = new Date(csvRow["Date"]);
    if (rowDate > startDate && rowDate < endDate) {
      return csvRow;
    }
  });

  //profit calcualtions
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
});

module.exports = router;
