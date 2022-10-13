const Cast = require("../models/Cast");
exports.uploadDB = async (req, res) => {
  try {
    var firstimage = "";
    var secondimage = "";

    if (req.files.uplactor != undefined) {
      firstimage = req.files.uplactor[0].filename;
    }
    if (req.files.uplactress != undefined) {
      secondimage = req.files.uplactress[0].filename;
    }

    const actor = new Cast({
      name: req.body.actor,
      image: firstimage,
      simage: secondimage,
    });
    console.log("dfdjks", actor);
    // const actress = new Cast({
    //   name: req.body.actress,
    //   image: secondimage,
    // });
    await actor.save();
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.send("hello");
  } catch (err) {
    res.send(err);
  }
};
