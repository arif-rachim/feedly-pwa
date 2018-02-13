const express = require('express');
const fetch = require("node-fetch");
const bodyParser = require('body-parser');
const stripTags = require('strip-tags');
const app = express();
const cache = {};
app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/api/*', (req, res) => {
  let api = req.originalUrl.substring('/api/'.length,req.originalUrl.length);
  getApi(api).then((json)=> res.status(200).send(json)).catch(err => {
    res.send(err);
  });
});

app.get('/clean-address',(req,res) => {
    let address = req.originalUrl.substr('/clean-address?address='.length,req.originalUrl.length);
    console.log('Hey we have address to request ',address);

    function appendStyle(html){
        let style = `
        <style>
        @import url('https://fonts.googleapis.com/css?family=Lato:300');
        * {
            font-family: 'Lato', sans-serif;
        }
        a {
            text-decoration-line: none;
            color: inherit;
        }
        body {
            padding : 1em;
            overflow: auto;
        }
        body > * {
            width: 100% !important;
        }
        *{
            margin-left: 0px !important;
        }
        </style>
        `;
        let indexOfBody = html.indexOf('</body>')
        html = html.substr(0,indexOfBody)+style+html.substr(indexOfBody,html.length);
        console.log('We have html ',html);
        return html;
    }
    fetch(address).then(result => result.text())
        .then(text => {
            //return appendStyle(stripTags(text,['nav','footer','iframe','input','form','head','ul','button','banner','header']));
            //return appendStyle(stripTags(text,['nav','footer','iframe','input','form','head','ul','button','banner']));
            return text;
        })
        .then(text => {
            res.status(200).send(text);
        })
        .catch(err => {
            res.send(err);
        });
});

app.post('/api/*', (req, res) => {
  let api = req.originalUrl.substring('/api/'.length,req.originalUrl.length);
  postApi(api,req.body).then((json)=> res.status(200).send(json)).catch(err => {
    res.send(err);
  });
});

const headers = {
   'Authorization': 'OAuth AywbKsSPN4YKjd9EEEqiaHxRtP2gg5jwQ7idyBkTtmp3WGZ3SAuZBzm5dvecS3Rp7T7QPaBqdNKRpLL7JtjL_IyCozVnZmvneAwmVMx-tgK2bvecM-Dumsl3MUNGDQhU035HijdQJQOfi2BLhp-cWcCJUq2gyWJaw-vFYSz2cbCravhUCQHRuUXIrSjMe6XvJ7Mbo7S__WCnSI4sdjeJ1bHt61vZpAp0mmT2HV_UGD24jdh3_nlLLg:feedlydev',
   'Accept': 'application/json',
   'Content-Type': 'application/json'
};


function getApi(api){
    let apiAddressUrl = `https://cloud.feedly.com/${api}`;
    let apiAddressKey = apiAddressUrl.substr(0,apiAddressUrl.indexOf("&continuation"));
    if(apiAddressKey in cache){
        console.log('We have the api in cache ',apiAddressKey);
        return Promise.resolve(cache[apiAddressKey]);
    }
	return fetch(apiAddressUrl,{headers: headers}).then(resolve => resolve.json()).then(response => {
	    console.log('storing to cache ',apiAddressKey,response);
	    cache[apiAddressKey] = response;
	    return response;
    });
}

function postApi(api,body){
	return fetch(`https://cloud.feedly.com/${api}`,{headers: headers,method:'POST',body:body}).then(resolve => resolve.json());
}


if (module === require.main) {
  const server = app.listen(process.env.PORT || 8080, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
}
