
function getName(author: string) {
  const name = author.split('<')[0];
  return name;
}

// convert a github username into a profile picture url
function getGitHubProfilePictureURL(username: string) {
  return 'https://github.com/' + encodeURI(username) + '.png';
}

// convert the first letter of a string into a profile (letter) picture url
function getLetterProfilePictureURL(letter: string) {
  return 'node_modules/material-letter-icons/dist/png/' + letter[0] + '.png';
}

// convert to a github username if the email is a github no reply email.
function usernameFromEmail(email: string) {
  if (email.includes('noreply.github.com')) {
    return email.match(new RegExp('[0-9]*\\+*([^@]+)@'))[1];
  } else {
    return null;
  }
}

function getProfilePictureURL(name: string, email: string, callback) {
  // try to construct username from github email
  const username = usernameFromEmail( email );

  // this code block was left in in-case we open an issue to
  // enable non-github emails to resolve to github usernames.

  // if not possible, try to fetch the github username from github.
  // if( username == null ) {
  //   if( callback != null ) { // only if we have provided a callback...
  //     githubUsername( email ).then( uname => {
  //       callback( getGitHubProfilePictureURL( uname ) );
  //     });
  //   }
  // }

  // if all else fails, resort to letters
  if ( username == null ) {
    return getLetterProfilePictureURL(name.toUpperCase());
  } else {
    // success! return the profile picture url
    return getGitHubProfilePictureURL(username);
  }
}
