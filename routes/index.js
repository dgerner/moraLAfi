
/*
 * GET home page.
 */

exports.index = function(req, res){
  var testArt = {
    "ObjectId": "2",
    "image": ["http://i.imgur.com/bEK1Raf.jpg", "http://i.imgur.com/OocQoSE.jpg", "http://i.imgur.com/8gDjxcY.jpg"],
    "description": "Need help designing/painting 2-wall mural. Open to all ideas, especially interested in portraits. South-facing wall approx 40ft x 20ft, west-facing approx 70ft x 20ft.",
    "name": "3431 E Cesar Chavez Ave",
    "street": "3431 E Cesar Chavez Ave",
    "city": "Los Angeles",
    "zip": "90063",
    "comments": [],
    "poster": "usc",
    "status": "Open",
    "startend": "Start by",
    "date": "6/1/2014",
    "artists": [
    
    ],
    "owner": "unknown",
    "lat": "34.041123",
    "lng": "-118.191405"
  };
  res.render('location', { title: 'muraLAfi', art: testArt });
};