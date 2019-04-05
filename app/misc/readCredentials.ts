let CryptoJS = require('crypto-js');
const os = require('os');
let jsonfile = require('jsonfile');
let fs = require('fs');
let file;

let encryptedPassword;
let encryptedUsername;

function decrypt() {

    file = 'data.json';

    let objRead = jsonfile.readFileSync(file); // JSON Object containing credentials

    encryptedUsername = objRead.username;
    encryptedPassword = objRead.password;

  }

function getUsername() {

    let decryptedUsernameBytes = CryptoJS.AES.decrypt(encryptedUsername.toString(), os.hostname());
    return decryptedUsernameBytes.toString(CryptoJS.enc.Utf8);
  }

function getPassword() {
    let decryptedPasswordBytes = CryptoJS.AES.decrypt(encryptedPassword.toString(), os.hostname());
    return decryptedPasswordBytes.toString(CryptoJS.enc.Utf8);
  }
