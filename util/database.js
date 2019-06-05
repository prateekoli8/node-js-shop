const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = callback => {
  MongoClient.connect('mongodb+srv://testuser:testuser@cluster0-7spbm.mongodb.net/shop?retryWrites=true')
  .then( client => {
    _db = client.db();
    callback();
  }
  )
  .catch(err => {
    console.log(err);
    throw err;
  });
} ;

const getDb = () => {
  if(_db) {
    return _db;
  }
  throw 'No Database Found';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
