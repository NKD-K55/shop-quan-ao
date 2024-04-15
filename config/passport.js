// config/passport.js
// load các module
var passport = require('passport');
var jwt = require("jsonwebtoken");
var FacebookStrategy = require('passport-facebook').Strategy;
const axios = require('axios');
const bcrypt = require('bcrypt');
var User = require('../models/user.model');
var LocalStrategy = require('passport-local').Strategy;

// passport session setup

// used to serialize the user for the session
passport.serializeUser(function(user, done){
    done(null, user.id);
})
 // used to deserialize the user
passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        done(err, user);
    })
})
// local sign-up
passport.use('local.signup',new LocalStrategy({
    usernameField:'email',
    passwordField:'password',
   
    passReqToCallback:true
},function(req, email, password, done) {
   
 User.findOne({ 'email': email }, function(err, user) {
        if (err) { return done(err); }
        if (user) {
          return done(null, false, { message : 'Email đã được sử dụng. Đăng nhập bằng ' + user.email+ '?'})
        }
       var newUser= new User();
       newUser.email= email;
       newUser.password=newUser.encryptPassword(password);
       newUser.name= req.body.name;
       newUser.role= "user";
       newUser.lock = 0;
       newUser.save(function(err, result){
         if(err){
           return done(err)
         }
         return done(null, newUser);
       })
      });
    }
  ));
// local sign-in
  passport.use('local.signin',new LocalStrategy({
   usernameField:'email',
   passwordField:'password',
   passReqToCallback:true
},function(req, email, password,done) {
  
User.findOne({ 'email': email }, function(err, user) {
       if (err) { return done(err); }
       if (!user) {
         return done(null, false, { message : 'Tài khoản không tồn tại'})
       }
       if(user.lock == 1){
        return done(null,false,{message:'Tài khoản của bạn đã bị khóa'})
       }
       if(!user.validPassword(password)){
      
           return done(null,false,{message:'Mật khẩu không đúng'})
       }else{
        req.session.loggin = true;
        req.session.role = true;
         return done(null, user );
       }
      
    
     });
   }
 ));
 //local-delete
 passport.use('local.delete',new LocalStrategy({
  usernameField:'email',
  passwordField:'password',
  passReqToCallback:true
},function(req, email, password,done) {
  User.deleteOne( {_id:req.params.id}, function(err,data){
    if(err){
      res.json({"kq":0, "errMsg": err});
    }else{
      res.redirect("../product");
    }
  })

  }
));
//local-update
//oauth-fb
async function getUserDatas(accessToken) {
  try {
    const response = await axios.get('https://graph.facebook.com/v19.0/me?fields=id,name,email', {
      params: {
        fields: 'email',
        access_token: accessToken
      }
    });
    return response.data.email;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

//tạo pass ngẫu nhiên
async function generateRandomHashedPassword() {
  try {
    const randomPassword = Math.random().toString(36).slice(-10);
    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(randomPassword, saltRounds);
  
    return hashedPassword;
  } catch (error) {
    console.error('Failed to generate random hashed password:', error);
    throw error;
  }
}

passport.use(new FacebookStrategy({
  accessToken: process.env.accessToken,
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "/auth/facebook/callback",
  profileFields: ['id', 'displayName']
  },
  async function(accessToken, refreshToken, profile, cb) {
    try{
      const user_email = await getUserDatas(accessToken);
      const user_randompass = await generateRandomHashedPassword();
      User.findOne({ 'email' : user_email},
        function(err, user){
          if (err) { return cb(err);}
  
          if (!user) {
            user = new User({
              email: user_email,
              // name: profile.username,
              name: profile.displayName,
              password: user_randompass,
              // role: "user",
              // lock: 0,
              facebook: profile._json
            });
            user.save(function(err) {
              if (err) console.log(err);
              return cb(err, user);
            });
          } else {
            return cb(err, user);
          }
        });
    } 
    catch(error) {
      console.log(error);
    }
  }

));

