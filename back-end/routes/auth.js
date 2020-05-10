var express = require("express");
var router = express.Router();
const passport = require("passport");
const CLIENT_HOME_PAGE_URL = "http://localhost:3000";
/* GET home page. */
const mu = require("../utils/mongoUtils")();
router.get("/login/success", (req, res) => {
  console.log("success? ", req.user);
  if (req.user) {
    mu.connect()
      .then((client) => mu.getUsers(client, req.user))
      .then((resp) => {
        console.log("success!*** ", resp);
        if (resp && resp.length)
          res.json({
            success: true,
            message: "user has successfully authenticated",
            user: resp[0],
            cookies: req.cookies,
          });
        else throw new Error("no user found");
      })
      .catch((err) => {
        throw new Error("server error", err);
      });
  } else {
    res.status(401).json({
      success: false,
      message: "user failed to authenticate.",
    });
  }
});

router.get("/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "user failed to authenticate.",
  });
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect(CLIENT_HOME_PAGE_URL);
});

router.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["email"],
  })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "/login",
    successRedirect: CLIENT_HOME_PAGE_URL,
  }),
  function (req, res) {
    console.log("profile after auth", req.user);
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

module.exports = router;
