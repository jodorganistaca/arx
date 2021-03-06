const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const FacebookStrategy = require("passport-facebook").Strategy;

const mu = require("./mongoUtils")();

module.exports = function (passport) {
  const cookieExtractor = function (req) {
    var token = null;
    if (req && req.cookies) {
      token = req.cookies["jwt"];
    }
    console.log("token", token);
    return token || ExtractJwt.fromAuthHeaderWithScheme("jwt");
  };

  let opts = {};
  opts.jwtFromRequest = cookieExtractor;
  opts.secretOrKey = process.env.COOKIE_SESSION_SECRET || "";

  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      console.log("user from token in passport ", jwt_payload);
      mu.connect()
        .then((client) => mu.getUsers(client, jwt_payload._id))
        .then((users) => {
          if (users && users.length) {
            return done(null, users[0]);
          } else {
            return done(null, false);
          }
        });
    })
  );

  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: "http://localhost:3001/auth/facebook/callback",
        profileFields: ["id", "displayName", "email"],
      },
      function (accessToken, refreshToken, profile, cb) {
        const prevUser = { ...profile._json };
        let user = {};
        if (prevUser && prevUser.id) {
          user["facebookId"] = prevUser.id;
          user["name"] = (prevUser && prevUser.name) || "";
          user["email"] = (prevUser && prevUser.email) || "";
          mu.connect()
            .then((client) => mu.findOrCreateUser(client, user))
            .then((resp) => {
              console.log("user founded in line 58", resp);
              if (resp && resp.value && resp.value._id)
                return cb(null, resp.value._id);
              else if (
                resp &&
                resp.lastErrorObject &&
                resp.lastErrorObject.upserted
              )
                return cb(null, resp.lastErrorObject.upserted);
              else return cb(new Error("User not found"));
            })
            .catch((err) => {
              return cb(err, null);
            });
        } else {
          return cb(new Error("no facebook info provided"), null);
        }
      }
    )
  );

  passport.serializeUser(function (user, done) {
    console.log("serializing user", user);
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    done(null, user);
  });
};
