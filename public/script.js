// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.4/firebase-app.js";

import * as rtdb from "https://www.gstatic.com/firebasejs/9.9.4/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB084cEPTJQlv3KXGFYQjrM1GD8uN0xxE4",
  authDomain: "twitter-8097c.firebaseapp.com",
  databaseURL: "https://twitter-8097c-default-rtdb.firebaseio.com",
  projectId: "twitter-8097c",
  storageBucket: "twitter-8097c.appspot.com",
  messagingSenderId: "1060416807080",
  appId: "1:1060416807080:web:c13ae474941df7c147229d",
  measurementId: "G-E6DY60MKNM"
};

// Firebase initializations
firebase.initializeApp(firebaseConfig);
const app = initializeApp(firebaseConfig);
let db = rtdb.getDatabase(app);

// Global variables - primarily for current user info
let renderedTweetLikeLookup = {};
let currUID = "";
let currURL = ""; // User's current profile picture

// Shows logged-in user in corner of tweets page
let helloFunc = (username, URL) => {
  let user = username;
  if (user == "") user = "Anonymous";
  $("#hello").html(`
    <div style="textarea: 200px;"><b>Hello ${user}!</div><br>
    <img src="${URL}" style="width:100px; height:100px;border-radius: 5px;">
  `);
  currURL = URL;
}

// Retrieves user info from database upon new login
let gatherUserData = (uid) => {
  firebase.database().ref('/users/' + uid).once("value", ss => {
    $("#screen_name").val(ss.val().username);
    $("#bio").val(ss.val().bio);
    $("#login_email").val(ss.val().email);
    helloFunc(ss.val().username, ss.val().URL);
    currURL = ss.val().URL;
  });
}

// Detects sign-in/register sign-in and adjusts user data accordingly
let userSignInOrRegister = (user) => {
  currUID = user.uid;
  let usersRef = rtdb.ref(db, `/users/${user.uid}`);
  gatherUserData(user.uid);
  $('#welcome_page').addClass('hidden');
  $('#main_page').removeClass('hidden');
}

// Error handler
let catchError = (error) => {
  var errorCode = error.code;
  var errorMessage = error.message;
  alert(errorMessage);
}

// Regular sign-in
let signIn = () => {
  firebase.auth().signInWithEmailAndPassword($("#login_email").val(), $("#login_pass").val()).then((userCredential) => {
    let user = userCredential.user;
    userSignInOrRegister(user);
  })
  .catch((error) => {
    catchError(error);
  });
}

// Sign-in upon registering new account
let signInRegister = () => {
  firebase.auth().signInWithEmailAndPassword($("#register_email").val(), $("#register_pass").val()).then((userCredential) => {
    userSignInOrRegister(userCredential.user);
  })
  .catch((error) => {
    catchError(error);
  });
}

// XSS prevention (may or may not work)
let sanitize = (str) => {
  return str.includes("<") || str.includes(">");
}

// Log-in handler for onAuthStateChanged
let renderLogin = ()=>{
  $("#login").on("click", () => {
    if (sanitize($("#login_pass").val()) || sanitize($("#login_email").val())) alert("FORBIDDEN CHARACTER(S)");
    else signIn();
  });
}

// Updates previous tweets for current logged-in user
let reRenderTweets = (newURL, newBio, newUsername, email)=>{
  firebase.database().ref(`/tweets/`).once('value', function(ss) {
    ss.forEach(function (childTweet) {
      if (childTweet.val().email == email) {
        let newTweetsRef = rtdb.ref(db, `/tweets/${childTweet.key}`);
        let newJSON = {
          'URL': newURL,
          'bio': newBio,
          'date': childTweet.val().date,
          'email': childTweet.val().email,
          'likes': childTweet.val().likes,
          'tweet': childTweet.val().tweet,
          'username': newUsername
        };
        rtdb.update(newTweetsRef, newJSON);
      }
    });
  });
}

// Updates user data and previous tweets
let saveUserData = (theURL, usersRef) => {
  helloFunc($("#screen_name").val(), theURL);
  let newJSON = {
    'username': $("#screen_name").val(),
    'bio': $("#bio").val(),
    'URL': theURL
  };
  firebase.database().ref(`/users/${currUID}`).once('value', function(ss) {
    reRenderTweets(theURL, $("#bio").val(), $("#screen_name").val(), ss.val().email);
  });
  rtdb.update(usersRef, newJSON);
}

// Render's logged-in user's profile
$("#hello").on("click", evt => {
  let bio = "";
  if ($("#bio").val() == "") bio = "No bio yet!"; // If user's bio is empty
  else bio = $("#bio").val();
  renderUserProfile($("#login_email").val(), $("#screen_name").val(), currURL, bio);
  $('#main_page').addClass('hidden');
  $('#profile_page').removeClass('hidden');
});

// Renders page and data based on log-in status
firebase.auth().onAuthStateChanged(function (user) {
  if (!!user) userSignInOrRegister(user);
  else renderLogin();
  $("#tweet").val("");
});

// Change to register page
$("#register").on("click", ()=>{
  $('#welcome_page').addClass('hidden');
  $('#register_page').removeClass('hidden');
});

// Change to forgot password page
$("#forgot").on("click", evt => {
  $('#welcome_page').addClass('hidden');
  $('#forgot_pass_page').removeClass('hidden');
});

// Sends forgot password email to specified email address
$("#send_email").on("click", evt => {
  firebase.auth().sendPasswordResetEmail($("#email_pass_forgot").val()).then(() => {
    alert("A reset password e-mail has been sent.\nIf you do not see the e-mail, please check your spam folder.");
    $('#forgot_pass_page').addClass('hidden');
    $('#welcome_page').removeClass('hidden');
  })
  .catch((error) => {
    catchError(error);
  });
});

// Return to welcome page from register page
$("#return_to_home").on("click", ()=>{
  $('#main_page').addClass('hidden');
  $('#register_page').addClass('hidden');
  $('#welcome_page').removeClass('hidden');
  $("#register_email").val("");
  $("#register_pass").val("");
});

// Return to welcome page from forgot password page
$("#return_to_home2").on("click", () => {
  $('#forgot_pass_page').addClass('hidden');
  $('#welcome_page').removeClass('hidden');
});

// Log-out handler
$("#logout").on("click", ()=>{
  firebase.auth().signOut();
  $('#main_page').addClass('hidden');
  $('#welcome_page').removeClass('hidden');
  $("#screen_name").val("");
  $("#login_email").val("");
  $("#login_pass").val("");
  $("#tweet").val("");
  $("#pic_upload").val("");
  $("#bio").val("");
});

// Register account handler
$("#register_account").on("click", evt => {
  if (sanitize($("#register_email").val()) || sanitize($("#register_pass").val())) alert("FORBIDDEN CHARACTER(S)");
  else {
    // Creates user and stores info in Firebase
    firebase.auth().createUserWithEmailAndPassword($("#register_email").val(), $("#register_pass").val()).then((userCredential) => {
      let email = $("#register_email").val();
      $("#login_email").val(email);
      let URL = "https://twirpz.files.wordpress.com/2015/06/twitter-avi-gender-balanced-figure.png"; // Default profile picture
      let bio = "";
      let username = "";
      const user = userCredential.user;
      let usersRef = rtdb.ref(db, `/users/${user.uid}`); // Reference to user info in Firebase
      if (usersRef) rtdb.set(usersRef, {email, URL, bio, username}); // Set user info in Firebase
      alert("Account successfully created.\nWelcome to Firebase Twitter!")
      $('#register_page').addClass('hidden');
      $('#main_page').removeClass('hidden');
      signInRegister();
      $("#register_email").val("");
      $("#register_pass").val("");
    })
    .catch((error) => {
      catchError(error);
    });
  }
});

// Settings button handler
$("#settings").on("click", evt => {
  $('#main_page').addClass('hidden');
  $('#settings_page').removeClass('hidden');
});

// Determines how to save user data within the user settings page
$("#save_return").on("click", evt => {
  if (sanitize($("#screen_name").val()) || sanitize($("#bio").val())) alert("FORBIDDEN CHARACTER(S)");
  else {
    if ($("#screen_name").val().length > 50) alert("Username must be 50 characters or less.");
    else if ($("#bio").val().length > 250) alert("Bio must be 250 characters or less.");
    else {
      let usersRef = rtdb.ref(db, `/users/${currUID}`);
      let myFile = $('#pic_upload').prop('files')[0];
      let newURL = "";
      let currEmail = "";
      if (!myFile) { // If no file is selected
        let theURL = "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png";
        newURL = theURL;
        saveUserData(theURL, usersRef);
      }
      else { // Set-up filereader event for when a file is selected
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(myFile);
          fileReader.addEventListener("load", async (evt)=>{
            let theFileData = fileReader.result;
            let storageDest = storageRef.child(myFile.name);
            storageDest.put(theFileData, {
          contentType: myFile.type,
        }).then(ss=>{
              ss.ref.getDownloadURL().then((theURL)=>{
                newURL = theURL;
                saveUserData(theURL, usersRef);
              })
            });
          });
      }
      $('#settings_page').addClass('hidden');
      $('#main_page').removeClass('hidden');
    }
  }
});

// Returns to tweets page without saving new user data
$("#exit_return").on("click", evt => {
  firebase.database().ref(`/users/${currUID}`).once('value', function(ss) {
    $("#bio").val(ss.val().bio);
    $("#screen_name").val(ss.val().username);
  });
  $('#settings_page').addClass('hidden');
  $('#main_page').removeClass('hidden');
});

// Returns to tweets page
$("#return_to_tweets").on("click", evt=>{
  $('#profile_page').addClass('hidden');
  $('#main_page').removeClass('hidden');
  $("#profile_data").text("");
});

// Generate a given user's profile page
let renderProfile = (email, username, imageURL, bio)=>{
  $("#profile_data").prepend(`
    <br>
    <div id="profile_data">
      <h3>Screen Name: ${username}</h3>
      <h6>Associated E-mail: ${email}</h6>
      <div>${imageURL}</div><br>
      <span style="font-size: 30px; font-family: 'Fugaz One'; text-decoration: underline;">Bio</span>
      <br><br><div><span id="bio_style">${bio}</span></div>
    </div>
  `);
}

// Renders a given user profile with parameters that provide the needed data
let renderUserProfile = (email, username, imageURL, bio)=>{
  $("#profile_data").prepend(`
    <br><div id="profile_data">
      <h3>Screen Name: ${username}</h3>
      <h6>Associated E-mail: ${email}</h6>
      <img src="${imageURL}" style="width:190px;height:190px;border-radius:7px;"><br><br>
      <span style="font-size: 30px; font-family: 'Fugaz One'; text-decoration: underline;">Bio</span>
      <br><br><div><span id="bio_style">${bio}</span></div>
    </div>
  `);
}

// Likes count handler
let toggleLike = (tweetRef, uid) => {
  tweetRef.transaction((tweetObj) => {
    if (tweetObj) {
      if (tweetObj.likes && tweetObj.likes_by_user[uid]) {
        tweetObj.likes--;
        tweetObj.likes_by_user[uid] = null;
      } else {
        tweetObj.likes++;
        if (!tweetObj.likes_by_user) {
          tweetObj.likes_by_user = {};
        }
        tweetObj.likes_by_user[uid] = true;
      }
    }
    return tweetObj;
  });
}

// Large handler for displaying tweets
let renderTweet = (tweetsObj, uuid)=>{
  $("#all_tweets").prepend(`
<div class="card mb-3" data-uuid="${uuid}" style="max-width: 540px; background-color: cyan; border-radius: 7px;">
  <div class="row g-0">
    <div class="col-md-4">
      <i data-urlid="${uuid}"><img src=${tweetsObj.URL}  style="width:190px;height:190px;border-radius:7px;"></i>
      </div>
    <div class="col-md-8">
      <div class="card-body">
        <span><h5 class="card-title" data-usernameid="${uuid}">${tweetsObj.username}   </h5><button data-emailid="${uuid}" class="text-muted" style="font-size:10px;margin-top:-1em;background-color:#0ca6f0;color:#0cf076;box-shadow: 0 4px #0c4af0;color:red;">${tweetsObj.email}</button></span><br><br><span class="followButton"><button data-id="${uuid}" style="margin-top:-1em;background-color:#0ca6f0;box-shadow: 0 4px #0c4af0;color:red;">FOLLOW</button></span>
        <br><br><p class="card-text">${tweetsObj.tweet}</p>
        <i data-tweetid="${uuid}" class="fa-solid fa-thumbs-up""></i>
        <p class="card-text">
        <small class="text-muted" id="date">
          Tweeted at ${new Date(tweetsObj.date).toLocaleString()}
        <span style="display: none;">
          <i data-bioid="${uuid}">${tweetsObj.bio}</i>
        </span>
        </small>
        </p>
    </div>
  </div>
</div>
`);
  // Individual likes for each tweet
  renderedTweetLikeLookup[uuid] = tweetsObj.likes;
  firebase.database().ref("/tweets").child(uuid).child("likes").on("value", ss=>{
    renderedTweetLikeLookup[uuid] = ss.val();
    $(`.fa-thumbs-up[data-tweetid=${uuid}]`).html(`<span style="font-family: 'Segoe UI'; font-size: 18px;">${renderedTweetLikeLookup[uuid]} Likes</span>`);
    });
}

// Reference to tweets in Firebase
let tweetsRef = rtdb.ref(db, `/tweets`);
var storageRef = firebase.storage().ref();

// Follow button(s) handler (not much functionality here)
let triggerFollow = (ID, emailID, currEmail) => {
  if (ID.text() == "FOLLOW") {
    if (currEmail === emailID.text()) alert("You cannot follow yourself.");
    else ID.text('UNFOLLOW');
  }
  else ID.text('FOLLOW');
}

// Handles events for when tweets are added to Firebase
rtdb.onChildAdded(tweetsRef, ss=>{
  let yourData = ss.val();
  renderTweet(yourData, ss.key);
  $(".fa-thumbs-up").off("click");
  $(".fa-thumbs-up").on("click", (evt)=>{
      let clickedTweet = $(evt.currentTarget).attr("data-tweetid");
      let likeCount = renderedTweetLikeLookup[clickedTweet];
      let tweetRef = firebase.database().ref("/tweets").child(clickedTweet);
      toggleLike(tweetRef, currUID);
    });
  $(`[data-id="${ss.key}"]`).on("click", evt => {
    triggerFollow($(`[data-id="${ss.key}"]`), 
                  $(`[data-emailid="${ss.key}"]`), 
                  $("#login_email").val());
  });
  $(`[data-emailid="${ss.key}"]`).on("click", evt => {
    renderProfile($(`[data-emailid="${ss.key}"]`).text(), 
                  $(`[data-usernameid="${ss.key}"]`).text(), 
                  $(`[data-urlid="${ss.key}"]`).html(),
                  $(`[data-bioid="${ss.key}"]`).text());
    $('#main_page').addClass('hidden');
    $('#profile_page').removeClass('hidden');
  });
});

// Large handler for when tweets are sent
$("#send").on("click", evt=>{
  let username = $("#screen_name").val();
  let tweet = $("#tweet").val();
  let email = $("#login_email").val();
  let bio = $("#bio").val();
  let likes = 0;
  let URL = currURL;
  let date = Date();
  let newRef = rtdb.push(tweetsRef);
  const fileReader = new FileReader();
  let myFile = $('#pic_upload').prop('files')[0];
  if ($("#tweet").val().includes("<") || $("#tweet").val().includes(">")) {
    alert("FORBIDDEN CHARACTER(S)");
  }
  else {
    if (!myFile) {
      if (username == "") username = "Anonymous";
      if (tweet == "") tweet = "Untitled";
      if (bio == "") bio = "No bio yet!";
      let theURL = "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png";
      $("#output").html(`
        <img src="${theURL}" style="width:190px;height:190px;"/>
      `);
      if (tweet.length > 250) alert("Tweet must be 250 characters or less.");
      else if (newRef) rtdb.set(newRef, {username, email, tweet, date, likes, bio, URL});
    }
    else {
      fileReader.readAsArrayBuffer(myFile); // File reader for displaying profile pic on tweet(s)
      fileReader.addEventListener("load", async (evt)=>{
        let theFileData = fileReader.result;
        let storageDest = storageRef.child(myFile.name);
        storageDest.put(theFileData, {
      contentType: myFile.type,
    }).then(ss=>{
          ss.ref.getDownloadURL().then((theURL)=>{
            URL = theURL;
            $("#output").html(`
     <img src="${theURL}" style="width:190px;height:190px;"/>
            `);
            if (tweet.length > 250) alert("Tweet must be 250 characters or less.");
            else if (newRef) rtdb.set(newRef, {username, email, tweet, date, likes, bio, URL});
          })
        });
      });
    }
  }
  
  if (username == "") username = "Anonymous";
  if (tweet == "") tweet = "Untitled";
  if (bio == "") bio = "No bio yet!";
});
