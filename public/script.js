// Import the functions you need from the SDKs you need
 import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.4/firebase-app.js";
 //import { getStorage, ref } from "/firebase/storage";
 import * as rtdb from "https://www.gstatic.com/firebasejs/9.9.4/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

firebase.initializeApp(firebaseConfig);
const app = initializeApp(firebaseConfig);
let db = rtdb.getDatabase(app);

let renderedTweetLikeLookup = {};
let currUID = "";
let currURL = "";

var showNextPage = function() {
  document.getElementById('page1').classList.add('hidden');
  document.getElementById('page2').classList.remove('hidden');
}

let helloFunc = (username, URL) => {
  $("#hello").html(`
    <div style="textarea: 200px;"><b>Hello ${username}!</div><br>
    <img src="${URL}" style="width:100px; height:100px;border-radius: 5px;">
  `);
  currURL = URL;
}

$("#hello").on("click", evt => {
  let bio = "";
  if($("#bio").val() == "") bio = "No bio yet!";
  else bio = $("#bio").val();
  renderUserProfile($("#email1").val(), $("#user1").val(), currURL, bio);
  document.getElementById('page2').classList.add('hidden');
  document.getElementById('profile_page').classList.remove('hidden');
});

function gatherUserDataStart(ss) {
  $("#user1").val(ss.val().username);
  $("#bio").val(ss.val().bio);
  helloFunc(ss.val().username, ss.val().URL);
}

function gatherUserData(uid) {
    firebase.database().ref('/users/' + uid).once("value", ss => {
        gatherUserDataStart(ss);
        currURL = ss.val().URL;
    });
}

let signIn = () => {
  firebase.auth().signInWithEmailAndPassword($("#email1").val(), $("#pass1").val()).then((userCredential) => {
    var user = userCredential.user;
    currUID = user.uid;
    let usersRef = rtdb.ref(db, `/users/${user.uid}`);
    gatherUserData(user.uid);
    showNextPage();
  })
    .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    alert(errorMessage);
  });
}

let signInRegister = () => {
  firebase.auth().signInWithEmailAndPassword($("#user2").val(), $("#pass2").val()).then((userCredential) => {
    var user = userCredential.user;
    currUID = user.uid;
    let usersRef = rtdb.ref(db, `/users/${user.uid}`);
    gatherUserData(user.uid);
    showNextPage();
  })
    .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    alert(errorMessage);
  });
}

let renderLogin = ()=>{
  $("#login").on("click", ()=>{
    if($("#user1").val().includes("<") || $("#user1").val().includes(">")) alert("FORBIDDEN CHARACTER(S)");
    else {
      signIn();
    }
  });
}
firebase.auth().onAuthStateChanged(function (user) {
  renderLogin();
});
//renderLogin();

$("#register").on("click", ()=>{
  document.getElementById('page1').classList.add('hidden');
  document.getElementById('page3').classList.remove('hidden');
});

$("#forgot").on("click", evt => {
  document.getElementById('page1').classList.add('hidden');
  document.getElementById('forgot_pass_page').classList.remove('hidden');
});

$("#send_email").on("click", evt => {
  firebase.auth().sendPasswordResetEmail($("#email_pass_forgot").val()).then(() => {
      alert("A reset password e-mail has been sent.\nIf you do not see the e-mail, please check your spam folder.");
    document.getElementById('forgot_pass_page').classList.add('hidden');
    document.getElementById('page1').classList.remove('hidden');
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(errorMessage);
  });
});

let renderReturnToHome = ()=>{
  $("#return").on("click", ()=>{
    document.getElementById('page2').classList.add('hidden');
    document.getElementById('page3').classList.add('hidden');
    document.getElementById('page1').classList.remove('hidden');
    document.getElementById('user2').value = "";
    document.getElementById('pass2').value = "";
  });
}
renderReturnToHome();

$("#return4").on("click", () => {
  document.getElementById('forgot_pass_page').classList.add('hidden');
  document.getElementById('page1').classList.remove('hidden');
});

let renderReturnToHome2 = ()=>{
  $("#logout2").on("click", ()=>{
    document.getElementById('page2').classList.add('hidden');
    document.getElementById('page1').classList.remove('hidden');
    $("#user1").val("");
    $("#email1").val("");
    $("#pass1").val("");
    $("#tweet1").val("");
    $("#fileupload").val("");
    $("#bio").val("");
  });
}
renderReturnToHome2();

$("#register2").on("click", evt => {
  if($("#user2").val().includes("<") || $("#user2").val().includes(">") || $("#pass2").val().includes("<") || $("#pass2").val().includes(">")) {
    alert("FORBIDDEN CHARACTER(S)");
  }
  else {
    firebase.auth().createUserWithEmailAndPassword($("#user2").val(), $("#pass2").val()).then((userCredential) => {
      let email = $("#user2").val();
      $("#email1").val(email);
      let URL = "https://twirpz.files.wordpress.com/2015/06/twitter-avi-gender-balanced-figure.png";
      let bio = "";
      let username = "Anonymous";

      const user = userCredential.user;
      let usersRef = rtdb.ref(db, `/users/${user.uid}`);
      if(usersRef) rtdb.set(usersRef, {email, URL, bio, username});
      alert("Account successfully created.\nWelcome to Firebase Twitter!")
      document.getElementById('page3').classList.add('hidden');
      document.getElementById('page2').classList.remove('hidden');
      signInRegister();
      $("#user2").val("");
      $("#pass2").val("");
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorMessage);
    });
  }
});

$("#settings").on("click", evt => {
  document.getElementById('page2').classList.add('hidden');
  document.getElementById('settings_page').classList.remove('hidden');
});

let reRenderTweets = (tweetsObj, uid, newURL, newBio, newUsername)=>{
  let newTweetsRef = rtdb.ref(db, `/tweets/${uid}`);
  let newJSON = {
    'URL': newURL,
    'bio': newBio,
    'date': tweetsObj.date,
    'email': tweetsObj.email,
    'likes': tweetsObj.likes,
    'tweet': tweetsObj.tweet,
    'username': newUsername
  };
  rtdb.update(newTweetsRef, newJSON);
}

$("#return3").on("click", evt => {
  if($("#user1").val().includes("<") || $("#user1").val().includes(">") || $("#bio").val().includes("<") || $("#bio").val().includes(">")) {
    alert("FORBIDDEN CHARACTER(S)");
  }
  else {
    if ($("#user1").val().length > 50) {
        alert("Username must be 50 characters or less.");
    }
    else if ($("#bio").val().length > 250) {
        alert("Bio must be 250 characters or less.");
    }
    else {
      let usersRef = rtdb.ref(db, `/users/${currUID}`);
      let myFile = $('#fileupload').prop('files')[0];
      if(!myFile) {
        let theURL = "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png";
        helloFunc($("#user1").val(), theURL);
        let newJSON = {
          'username': $("#user1").val(),
          'bio': $("#bio").val(),
          'URL': theURL
        };
        rtdb.update(usersRef, newJSON);
      }
      else {
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(myFile);
          fileReader.addEventListener("load", async (evt)=>{
            let theFileData = fileReader.result;
            let storageDest = storageRef.child(myFile.name);
            storageDest.put(theFileData, {
          contentType: myFile.type,
        }).then(ss=>{
              ss.ref.getDownloadURL().then((theURL)=>{
                helloFunc($("#user1").val(), theURL);
                let newJSON = {
                  'username': $("#user1").val(),
                  'bio': $("#bio").val(),
                  'URL': theURL
                };
                rtdb.update(usersRef, newJSON);
              })
            });
          });
      }
      document.getElementById('settings_page').classList.add('hidden');
      document.getElementById('page2').classList.remove('hidden');
    }
  }
});

$("#return5").on("click", evt=>{
  document.getElementById('profile_page').classList.add('hidden');
  document.getElementById('page2').classList.remove('hidden');
  $("#profiledata").text("");
});

let renderProfile = (email, username, imageURL, bio)=>{
  $("#profiledata").prepend(`
    <div id="profile_data">
      <h3>Screen Name: ${username}</h3>
      <h6>Associated E-mail: ${email}</h6>
      <div>${imageURL}</div><br>
      <span style="font-size: 30px; font-family: 'Fugaz One'; text-decoration: underline;">Bio</span>
      <div><span id="bio_style">${bio}</span></div>
    </div>
  `);
}

let renderUserProfile = (email, username, imageURL, bio)=>{
  $("#profiledata").prepend(`
    <div id="profile_data">
      <h3>Screen Name: ${username}</h3>
      <h6>Associated E-mail: ${email}</h6>
      <img src="${imageURL}" style="width:190px;height:190px;border-radius:7px;"><br>
      <span style="font-size: 30px; font-family: 'Fugaz One'; text-decoration: underline;">Bio</span>
      <div><span id="bio_style">${bio}</span></div>
    </div>
  `);
}

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

let renderTweet = (tweetsObj, uuid)=>{
  $("#sessiondata").prepend(`
<div class="card mb-3" data-uuid="${uuid}" style="max-width: 540px; background-color: cyan; border-radius: 7px;">
  <div class="row g-0">
    <div class="col-md-4">
      <i data-urlid="${uuid}"><img src=${tweetsObj.URL} style="width:190px;height:190px;border-radius:7px;"></i>
      </div>
    <div class="col-md-8">
      <div class="card-body">
        <h5 class="card-title" data-usernameid="${uuid}">${tweetsObj.username}</h5><span><button data-id="${uuid}">FOLLOW</button></span>
        <p class="card-text"><small data-emailid="${uuid}" class="text-muted" style="border:3px blue solid;border-radius:5px">${tweetsObj.email}</p></small>
        <p class="card-text">${tweetsObj.tweet}</p>
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
  renderedTweetLikeLookup[uuid] = tweetsObj.likes;
  firebase.database().ref("/tweets").child(uuid).child("likes").on("value", ss=>{
    renderedTweetLikeLookup[uuid] = ss.val();
    $(`.fa-thumbs-up[data-tweetid=${uuid}]`).html(`<span style="font-family: 'Segoe UI'; font-size: 18px;">${renderedTweetLikeLookup[uuid]} Likes</span>`);
    });
}

// Initialize Firebase
let tweetsRef = rtdb.ref(db, `/tweets`);
var storageRef = firebase.storage().ref();

rtdb.onChildAdded(tweetsRef, ss=>{
  let yourData = ss.val();
  renderTweet(yourData, ss.key);
  $(".fa-thumbs-up").off("click");
  $(".fa-thumbs-up").on("click", (evt)=>{
      let clickedTweet = $(evt.currentTarget).attr("data-tweetid");
      let likeCount = renderedTweetLikeLookup[clickedTweet];
      let tweetRef = firebase.database().ref("/tweets").child(clickedTweet);
      toggleLike(tweetRef, ss.key);
    });
  $(`[data-id="${ss.key}"]`).on("click", evt => {
    if($(`[data-id="${ss.key}"]`).text() == "FOLLOW") {
      if($("#email1").val() === $(`[data-emailid="${ss.key}"]`).text()) {
        alert("You cannot follow yourself.");
      }
      else {
        $(`[data-id="${ss.key}"]`).text('UNFOLLOW');
      }
    }
    else {
      $(`[data-id="${ss.key}"]`).text('FOLLOW');
    }
  });
  $(`[data-emailid="${ss.key}"]`).on("click", evt => {
    renderProfile($(`[data-emailid="${ss.key}"]`).text(), $(`[data-usernameid="${ss.key}"]`).text(), $(`[data-urlid="${ss.key}"]`).html(), $(`[data-bioid="${ss.key}"]`).text());
    document.getElementById('page2').classList.add('hidden');
    document.getElementById('profile_page').classList.remove('hidden');
  });
});

$("#send").on("click", evt=>{
  let username = $("#user1").val();
  let tweet = $("#tweet1").val();
  let email = $("#email1").val();
  let bio = $("#bio").val();
  let likes = 0;
  let URL = currURL;
  let date = Date();
  
  let newRef = rtdb.push(tweetsRef);
  
  const fileReader = new FileReader();
  let myFile = $('#fileupload').prop('files')[0];
  if($("#tweet1").val().includes("<") || $("#tweet1").val().includes(">")) {
    alert("FORBIDDEN CHARACTER(S)");
  }
  else {
    if(!myFile) {
      if(username == "") username = "Anonymous";
      if(tweet == "") tweet = "Untitled";
      if(bio == "") bio = "No bio yet!";
      let theURL = "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png";
      $("#output").html(`
        <img src="${theURL}" style="width:190px;height:190px;"/>
      `);
      if (tweet.length > 250) {
        alert("Tweet must be 250 characters or less.");
      }
      else if (newRef) rtdb.set(newRef, {username, email, tweet, date, likes, bio, URL});
    }
    else {
      fileReader.readAsArrayBuffer(myFile);
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
            if (tweet.length > 250) {
              alert("Tweet must be 250 characters or less.");
            }
            else if (newRef) rtdb.set(newRef, {username, email, tweet, date, likes, bio, URL});
          })
        });
      });
    }
  }
  
  if(username == "") username = "Anonymous";
  if(tweet == "") tweet = "Untitled";
  if(bio == "") bio = "No bio yet!";
});
