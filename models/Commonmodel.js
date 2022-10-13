var express = require("express");
var router = express();
var path = require("path");
const session = require("express-session");

var multer = require("multer");

var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/it_training";
var { ObjectID } = require("mongodb");

const insertnewdata = (table, newdata, insertmsg) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo.collection(table).insertOne(newdata, function (err, res) {
      // session.massage = "Inserted successfully";
      session.massage = insertmsg;
    });
  });
};

const insertdata = (table, isrtdata, updatemsg) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection(table)
      .findOneAndUpdate(
        { oid: "1" },
        { $set: isrtdata },
        { upsert: true, returnNewDocument: true },
        function (err, res) {
          session.massage = updatemsg;
        }
      );
  });
};

const insertmetadata = (table, isrtmeta, metamsg, metatype) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo
      .collection(table)
      .findOneAndUpdate(
        { oid: "1", type: metatype },
        { $set: isrtmeta },
        { upsert: true, returnNewDocument: true },
        function (err, res) {
          session.massage = metamsg;
        }
      );
  });
};

const updatedata = (table, upid, updatearr, updateinfo) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("it_training");

    dbo
      .collection(table)
      .updateOne(
        { _id: ObjectID(upid) },
        { $set: updatearr },
        { returnNewDocument: true },
        function (err, res) {
          session.massage = updateinfo;
        }
      );
  });
};

const deletebyid = (table, id, deletemsg) => {
  MongoClient.connect(url, function (err, db) {
    // session.message = deletemsg;
    if (err) throw err;
    var dbo = db.db("it_training");
    dbo.collection(table).deleteOne({ _id: ObjectID(id) }, function (err, res) {
      session.message = deletemsg;
    });
  });
};

module.exports = {
  insertdata,
  insertnewdata,
  updatedata,
  deletebyid,
  insertmetadata,
};
