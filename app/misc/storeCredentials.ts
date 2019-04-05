let CryptoJS = require('crypto-js');
const os = require('os');
let jsonfile = require('jsonfile');
let fs = require('fs');
let encryptedPassword;
let encryptedUsername;


function encrypt(username, password) {

    // OS.hostname() is the key.
    // AES encryption

    encryptedUsername = CryptoJS.AES.encrypt(username, os.hostname());
    encryptedPassword = CryptoJS.AES.encrypt(password, os.hostname());


    writetoJSON(encryptedUsername, encryptedPassword);

}

function encryptTemp(username, password) {
  encryptedUsername = CryptoJS.AES.encrypt(username, os.hostname());
  encryptedPassword = CryptoJS.AES.encrypt(password, os.hostname());
}

function getUsernameTemp() {

  let decryptedUsernameBytes = CryptoJS.AES.decrypt(encryptedUsername.toString(), os.hostname());
  return decryptedUsernameBytes.toString(CryptoJS.enc.Utf8);
}

function getPasswordTemp() {

  let decryptedPasswordBytes = CryptoJS.AES.decrypt(encryptedPassword.toString(), os.hostname());
  return decryptedPasswordBytes.toString(CryptoJS.enc.Utf8);
}

function writetoJSON(encryptedUsername, encryptedPassword) {
   let file = 'data.json';
   let obj = {username: encryptedUsername.toString(), password: encryptedPassword.toString()};

   jsonfile.writeFile(file, obj, function(err) {
     if (err) { throw err; }
   });

}



