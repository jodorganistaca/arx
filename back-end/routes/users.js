"use strict";

let express = require("express");
let router = express.Router();
let MongoUtils = require("../utils/mongoUtils");
const mu = MongoUtils();

/* GET users listing. */
router.get("/", function (req, res) {
  res.send("respond with a resource");
});

router.post("/", function (req, res) {
  let user = {};//const { user } = req.body;
  if (req.body.name) user["name"] = req.body.name;
  if (req.body.phone) user["phone"] = req.body.phone;
  if (req.body.email) user["email"] = req.body.email;
  if (req.body.info) user["info"] = req.body.info;
  if (req.body.tastes) user["tastes"] = req.body.tastes;
  if (req.body.lookingFor) user["lookingFor"] = req.body.lookingFor;
  user["unconnections"] = [];

  mu.connect()
    .then((client) => mu.createClient(client, user))
    .then((resp) => {
      res.status(200).json({
        success: true,
        msg: "User created successfully",
        data: resp,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        success: false,
        msg: "Failure creating user",
        error: err,
      });
    });
});

router.post("/update", function (req, res) {
  let user = {};//const { user } = req.body;

  if (req.body.name) user["name"] = req.body.name;
  if (req.body.phone) user["phone"] = req.body.phone;
  if (req.body.city) user["city"] = req.body.city;
  if (req.body.age) user["age"] = req.body.age * 1;
  if (req.body.phone) user["phone"] = req.body.phone;
  if (req.body.about) user["about"] = req.body.about;
  if (req.body.gender) user["gender"] = req.body.gender;
  if (req.body.lkfAgeMin) user["lkfAgeMin"] = req.body.lkfAgeMin;
  if (req.body.lkfAgeMax) user["lkfAgeMax"] = req.body.lkfAgeMax;
  if (req.body.lkfGender) user["lkfGender"] = req.body.lkfGender;

  console.log("user", user);

  mu.connect()
    .then((client) => mu.updateUser(client, req.query.userid, user))
    .then((resp) => {
      console.log("response", resp);
      if (resp && resp.value)
        res.status(200).json({
          success: true,
          msg: "User updated successfully",
          data: resp.value,
        });
      else throw new Error("response not found", resp);
    })
    .catch((err) => {
      return res.status(500).json({
        success: false,
        msg: "Failure updating user",
        error: err,
      });
    });
});

router.post("/addTastes", function (req, res) {
  mu.connect()
    .then((client) => mu.addTastes(client, req.query.userid, req.body.tastes))
    .then((resp) => {
      res.status(200).json({
        success: true,
        msg: "User tastes added successfully",
        data: resp,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        success: false,
        msg: "Failure adding user tastes",
        error: err,
      });
    });
});

router.post("/addUnconnections", function (req, res) {
  mu.connect()
    .then((client) =>
      mu.addTastes(client, req.query.userid, req.body.unconnections)
    )
    .then((resp) => {
      res.status(200).json({
        success: true,
        msg: "User unconnections added successfully",
        data: resp,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        success: false,
        msg: "Failure adding user unconnections",
        error: err,
      });
    });
});

router.post("/addComments", function (req, res) {
  mu.connect()
    .then((client) =>
      mu.addComments(client, req.query.userid, req.body.comments)
    )
    .then((resp) => {
      res.status(200).json({
        success: true,
        msg: "User comments added successfully",
        data: resp,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        success: false,
        msg: "Failure adding user comments",
        error: err,
      });
    });
});

module.exports = router;
