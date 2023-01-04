const fs = require("fs");
const EmlParser = require("eml-parser");
const Papa = require("papaparse");
const path = require("path");

// specify the path to the EML folder and the output CSV file
const emlFolderPath = "mailsbruts/envoi";
const csvFilePath = "./results.csv";

// create an array to store the parsed data
// read the contents of the EML folder
fs.readdir(emlFolderPath, (err, files) => {
  if (err) {
    console.error(err);
    return;
  }

  // loop through the EML files in the folder
  Promise.all(
    files
      .filter((file) => file.endsWith(".eml"))
      .map((file) => {
        // open a stream on the EML file
        const emlStream = fs.createReadStream(`${emlFolderPath}/${file}`);
        // parse the EML file using the emailjs-mime-parser library
        return new EmlParser(emlStream).parseEml();
        // store the extracted data in the parsedData array
      })
  )
    .then((data) => {
      const parsedData = data
        .filter(({ from }) => from.value[0].name === "John DOE")
        .map(({ subject, from, to, date }) =>
          // properties in result object:
          // {
          //	"attachments": [],
          //	"headers": {},
          //	"headerLines": [],
          //	"html": "",
          //	"text": "",
          //	"textAsHtml": "",
          //	"subject": "",
          //	"references": "",
          //	"date": "",
          //	"to": {},
          //	"from": {},
          //	"cc": {},
          //	"messageId": "",
          //	"inReplyTo": ""
          // }
          [
            subject,
            date,
            from.value[0].name,
            ...to.value.map(({ name }) => name),
          ]
        );
      // convert the parsedData array to a CSV string
      const csv = Papa.unparse(parsedData);

      // write the CSV string to the output file
      fs.writeFile(csvFilePath, csv, (err) => {
        if (err) {
          console.error(err);
          return;
        }

        console.log(`Parsed data written to ${csvFilePath}`);
      });
    })
    .catch((err) => {
      console.log(err);
    });
});
