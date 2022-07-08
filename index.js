const PORT = 3000;
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const axios = require('axios').default;
const express = require('express')
const app = express()
const cors = require('cors');
const { Axios } = require('axios');
const res = require('express/lib/response');
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());


const client_id = 'd4ece7a4b0814c7e69d6';
const client_sceret = '12c561a0f10c546ef5baa344d454cfcafa034f5b';
const LoginURL = `https://github.com/login/oauth/authorize?client_id=${client_id}`;



app.get('/login', (req, res) => {
  res.send({ url: LoginURL })
});


let token = null;
app.post('/oauth-callback', (req, res, next) => {
  const contentBody = req.body;
  const body = {
    client_id: contentBody.client_id,
    client_secret: contentBody.client_sceret,
    code: contentBody.code
  };
  // console.log("CODE :",body.code)
  if (body.code != null) {
    const opts = { headers: { accept: 'application/json' } };
    axios.post(`https://github.com/login/oauth/access_token`, body, opts).
      then(res => res.data['access_token']).
      then(_token => {
        token = _token;
        // console.log('My token:', token);
        res.status(200).json({
          token: token
        });
      }).
      catch(err => res.status(500).json({ message: err.message }));
  } else {
    console.error("Error")
  }
});


app.get('/success', (req, res) => {
  // USERNAME = 'DeviPanchal';
  // Demo = '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';
  axios({
    method: 'get',
    url: ` https://api.github.com/user`,
    headers: {
      Authorization: 'token ' + token
    }
  })
    .then((response) => {
      res.status(200).json({
        LoginData: response.data
      });
    })
});



app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))

var Dependencies = {}
var devDependencies = {}

var url = "mongodb://localhost:27017/";


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))




app.post('/fetching_packages', function (req, res) {
  dataSource = req.body;
  debugger
  Dependencies = dataSource.Dependencies;
  devDependencies = dataSource.devDependencies;
  // console.log(Dependencies);
  // console.log(devDependencies)
  res.json(dataSource)
  
  Reading_files()

})

app.get('/fetched_data', function (req, res) {
  // console.log(Dependencies); 


  res.status(200).send({
    Dependencies,
    devDependencies
  })
})

const path = require('path');
const directoryPath = path.join(__dirname, 'demo',);
const fs = require('fs');
const fsp = require('fs').promises;
const fse = require('fs-extra');


function Reading_files() {
  console.log("Reading_Files Function Called")
  let filenames = '';
  filenames = fs.readdirSync(directoryPath);
  if (filenames.length === 0) {
    console.log("**","Folder Empty....")
    Find_packages();
    return true;
  }
  console.log("***", filenames)
  Selecting_files(filenames);
}
async function Selecting_files(All_files) {

  // console.log("Selecting_Files Function Called")
  const SelectedFiles = [];
  for (let i = 0; i < All_files.length; i++) {
    if (i == 500)
      break;
    SelectedFiles[i] = All_files[i];
    
    // console.log(SelectedFiles[i])
    // await resolveAfter2Seconds();
    
  }
  Data_Extracted(SelectedFiles);

}

async function Data_Extracted(List_of_files) {
  // console.log("Data_Extracted Function Called")

  const CVE_DETAILS = []

    for (let i = 0; i < List_of_files.length; i++) {
     var filePath = path.join(__dirname, 'demo', List_of_files[i]);

    const data = await fsp.readFile(filePath, { encoding: 'utf-8' });
    

    const text = data;
    const obj = JSON.parse(text);
    const CVE_ID = obj?.cve?.CVE_data_meta?.ID;
    const CVE_DESCRIPTION = obj?.cve?.description?.description_data[0]?.value;
    const CVE_SEVERITY = obj?.impact?.baseMetricV2?.severity;
    const CVE_VERSION = obj?.impact?.baseMetricV2?.cvssV2?.version;
    const CVE_BASESCORE = obj?.impact?.baseMetricV2?.cvssV2?.baseScore;
    // console.log(CVE_ID);
    // console.log(CVE_DESCRIPTION);
    // console.log(CVE_VERSION);
    // console.log(CVE_BASESCORE);
    // console.log(CVE_SEVERITY);
    // await resolveAfter2Seconds();
   // CVE_DETAILS.push({
    
     // "CVEID": CVE_ID,
    //  "DESCRIPTION": CVE_DESCRIPTION,
      //"VERSION": CVE_VERSION,
   //   "BASESCORE": CVE_BASESCORE,
     // "SEVERITY": CVE_SEVERITY
   // })
    // console.log("Details pushed in an array ",i)



  }
  // console.log("for loop completed")

  Mongodb_Connection(CVE_DETAILS, List_of_files);
}

async function Mongodb_Connection(CVE_data_set, ListOfFiles) {
  // conso++le.log("Mongodb_Connection Function Called")
  const database = await MongoClient.connect(url)
  // console.log("Mongo Client Connected")
  debugger
  var database_collection = database.db("CVE");
  database_collection.collection("CVEs").count(function (err, count) {
    if (!err && count == 0) {
      // console.log("Length :",CVE_data_set.length) 
      database_collection.collection("CVEs").insertMany(CVE_data_set, function (err, res) {
        // console.log("Data Inserted into Database if Empty")
        if (err) { console.log(err) }
        // console.log("Inserted"); 
      })
      database_collection.collection("CVEs").createIndex({ "DESCRIPTION": "text" });
    }
    else {
      // console.log("Length :",CVE_data_set.length)
      database_collection.collection("CVEs").createIndex({ "DESCRIPTION": "text" });
      for (let i = 0; i < CVE_data_set.length; i++) {
        // console.log(CVE_data_set[i].CVEID)

        database_collection.collection("CVEs").findOne({ "CVEID": CVE_data_set[i].CVEID }, function (err, result) {
          if (err) {
            console.log('error>>' ,err);
          };

          if (result == null) {
            database_collection.collection("CVEs").insertOne(CVE_data_set[i], function (err, res) {
              // console.log("Data Inserted into Database")
              if (err) { console.log(err) }
              // console.log(CVE_data_set[i].CVEID,"Inserted"); 
            })
          }
          else {
            let Matched_CVE_ID = result.CVEID;
            // console.log("CVE-ID : "+ Matched_CVE_ID+ " already exist in the Database...!!!");
          }
        });
      }
    }
  })

  Move_Files(ListOfFiles);
}

async function Move_Files(List) {

  // console.log("Move_Files Function Called")
  const dir = './temp';
  if (!fs.existsSync(dir)) {
    // await resolveAfter2Seconds();
    fs.mkdirSync(dir, { recursive: true });

    for (let i = 0; i < List.length; i++) {
      await fsp.rename(directoryPath + '/' + List[i], dir + '/' + List[i])
    }
    // console.log('Done...!!!')
    ForWait();
  }
  else {
    for (let i = 0; i < List.length; i++) {
      await fsp.rename(directoryPath + '/' + List[i], dir + '/' + List[i])
    }
    ForWait();
  }
}

function ForWait() {
  // console.log("Ek Aur Koshish");
  Reading_files();
}


async function Find_packages() {
  const database = await MongoClient.connect(url);
  var database_collection = database.db("CVE");
  

// // var Found = database_collection.collection("CVEs").find({"DESCRIPTION": /.*CORS.*/});
// var Found =await database_collection.collection("CVEs").find({"DESCRIPTION": /.*CORS.*/}).toArray();
  
// console.log(Found,"##");
// console.log("database_collectiondatabase_collection", test)
  var array = Object.keys(Dependencies);
  for (i = 0; i < array.length; i++) {
    
    Substring = array[i].substring(array[i].lastIndexOf("/")+1,array[i].length);
  var Found =await database_collection.collection("CVEs").find({DESCRIPTION:{$regex : Substring}}).toArray();  

    // database_collection.collection("CVE-DETAILS").findOne({ $text : { $search: 'axios' } })

    console.log('matched file', Substring)

    console.log("this is ce data", Found.CVEID)
  }

}

const databasename = "CVE";  // Database name
MongoClient.connect(url).then((client) => {
  
    const connect = client.db(CVE);
  
    // Connect to collection
    const collection = connect
        .collection("CVEs");
  
    collection.find({}).toArray().then((ans) => {
        console.log("heyy",ans);
    });
}).catch((err) => {
  
    // Printing the error message
    console.log("error",err.Message);
})