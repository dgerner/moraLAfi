
exports.get = function(req, res) {

    var testProfile = {
      "profile_image": "http://2.bp.blogspot.com/-ckfRSGnpE5o/Tx8v17BID8I/AAAAAAAAFoc/TlfNkgiSgSg/s1600/crosby+concussion+interview.jpg",
      "description": "Recently completed mural for the Bristol Apartment Complex in Downtown LA",
      "name": "Dave Gerner",
      "projects": "8",
      "instagram": "gernerpsu",
      "images": [
        {
          "image": "https://www.omg.travel/content/streetart/image09.jpg"
        },
        {
          "image": "https://www.omg.travel/content/streetart/image20.jpg"
        }
      ]
    }

  	res.render('profile', {profile:testProfile});
};