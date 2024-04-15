var express = require("express")
var about = express.Router()

const { requiresAuth } = require('express-openid-connect');

about.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});


about.get("/about",checklogin,(req,res)=>{
  
    res.render("user/about")
    
});
function checklogin(req, res){
   if(req.session.login){
       user = req.user
       res.render("user/about")
   }else{
       user == null
       res.render("user/about")
   }
}
module.exports = about