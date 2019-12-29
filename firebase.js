var admin = require("firebase-admin");

// Fetch the service account key JSON file contents
var serviceAccount = require("./serviceAccountKey.json");

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fxbot-c80cd.firebaseio.com/"
});

async function getData(path) {
    let res = await admin
    .database()
    .ref(path)
    .once('value');
    return res.val();
}
exports.getData = getData;

async function setData(path, value) {
    let res = await admin
    .database()
    .ref(path)
    .set(value);
    return res;
}
exports.setData = setData;