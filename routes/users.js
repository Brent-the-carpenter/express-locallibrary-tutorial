const express = require("express");
const router = express.Router();

/* GET users listing. */
router.get("/cool", function (req, res, next) {
  res.render("cool", {
    msg1: "You're so cool",
    msg2: "Don't worry man you will have a job coding soon enough!",
  });
});

module.exports = router;
