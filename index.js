const express = require('express');
const fetch = require("node-fetch");
const bodyParser = require('body-parser')
const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/api/*', (req, res) => {
  let api = req.originalUrl.substring('/api/'.length,req.originalUrl.length);
  getApi(api).then((json)=> res.status(200).send(json)).catch(err => {
    res.send(err);
  });
});

app.post('/api/*', (req, res) => {
  let api = req.originalUrl.substring('/api/'.length,req.originalUrl.length);
  postApi(api,request.body).then((json)=> res.status(200).send(json)).catch(err => {
    res.send(err);
  });
});

const headers = {
   'Authorization': 'OAuth AwLoSsRxGV5Au1axU6Q9VbuFB85QW-yzF_wiWYgzYTJsjvLVwcZpRsNK98QNU52DECTAh8Icf0eB1fqrpC5z4KhzjtarTaxRR4J0u7tm2QzvY0RkOWdEZbbXSxcScUAVL-rzJ3Sf1EpQoJrk1NxbmFEmwOQLXl-I9BUpXmHm6gtB6gtVk7CVSdG_zPrtl1K04oKhEvKPTHrmcOYJqEXgWcUXcfbRcVMJ-0dTUVta2ZCAjm8ne4kB0KV_wSak:feedlydev',
   'Accept': 'application/json',
   'Content-Type': 'application/json'
};


function getApi(api){
	return fetch(`https://cloud.feedly.com/${api}`,{headers: headers}).then(resolve => resolve.json());
}

function postApi(api,body){
	return fetch(`https://cloud.feedly.com/${api}`,{headers: headers,method:'POST',body:body}).then(resolve => resolve.json());
}


if (module === require.main) {
  const server = app.listen(process.env.PORT || 8081, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
}
