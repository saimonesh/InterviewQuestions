const express = require('express')
const app = express()
app.use(express.json())
const pool=require("./db");
var https = require('follow-redirects').https;
var fs = require('fs');
app.get('/getTopVenue',async (req,res)=>{
    const startTime=req.query.startTime;
    const endTime=req.query.endTime;
     try{
         console.log(startTime+" "+endTime);
        const result=await pool.query("select venueid,count(venueid) as count from venues where utctimestamp>($1) and utctimestamp<($2) group by venueid ORDER BY count DESC limit 1",[startTime,endTime]);
        res.send(result.rows);
    }catch(err)
    {
        console.log(err.message);
    }

})
app.get('/getLocation',async(req,res)=>{
    const venueid=req.query.venueID;
    try{
        const result=await pool.query('select latitude,longitude from venues where venueid=($1) limit 1;',[venueid]);
        const locationDetails=result.rows[0];
        console.log(locationDetails);
        const path='/reverse?format=jsonv2&lat='+locationDetails.latitude+'&lon='+locationDetails.longitude;
        var options = {
            'method': 'GET',
            'hostname': 'nominatim.openstreetmap.org',
            'path': path,
            'headers': {
            },
            'maxRedirects': 20
          };
          var req = await https.request(options, function (res) {
            var chunks = [];
          
            res.on("data", function (chunk) {
              chunks.push(chunk);
            });
          
            res.on("end", function (chunk) {
                console.log("ended");
              var body = Buffer.concat(chunks);
              console.log(body.toString());
            });
          
            res.on("error", function (error) {
              console.error(error);
            });
          });

        req.end();
        
   
    }catch(err)
    {
        console.log(err);
    }
    res.send('');
    
})
app.listen(3000)