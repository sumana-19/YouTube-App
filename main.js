//options
      const CLIENT_ID = '243182222488-lbq5t7dhdsa9rgiitdvrvih0n0caedi0.apps.googleusercontent.com';
      const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"];
      const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';

      const authorizeButton = document.getElementById('authorize-button');
      const signoutButton = document.getElementById('signout-button');
      const content = document.getElementById('content');
      const channelForm = document.getElementById('channel-form');
      const channelInput = document.getElementById('channel-input');
      const videoContainer = document.getElementById('video-container');

      const defaultChannel = 'techguyweb';
      //form submit and change channel
      channelForm.addEventListener('submit', e=>{
        e.preventDefault();

        const channel = channelInput.value;

        getChannel(channel);
      });



      //load auth2 library
      function handleClientLoad(){
      	gapi.load('client:auth2',initClient);
      }

      //Init api client library and set up sign in listen
      function.initClient(){
      	gapi.client.init({
      		discoveryDocs: DISCOVERY_DOCS,
      		clientId: CLIENT_ID,
      		scope:SCOPES
      	}).then(() => {
           //listen for sign in state changes
           gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
           //handle initial sign in state
           updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
           authorizeButton.onclick = handleAuthClick;
           signoutButton.onclick = handleSignoutClick;
      	});
      }
      //update UI sign in state changes
      function updateSigninStatus(isSignedIn){
      	if(isSignedIn){
           authorizeButton.style.display='none';
           signoutButton.style.display='block';
           content.style.display='block';
           videoContainer.style.display='block';
           getChannel(defaultChannel);
      	} else{
           authorizeButton.style.display='block';
           signoutButton.style.display='none';
           content.style.display='none';
           videoContainer.style.display='none';
      	}

      }


      //handle login
      
function handAuthClick(){
	gapi.auth2.getAuthInstance().signIn();
}

//handle log out
function handleSignoutClick(){
	gapi.auth2.getAuthInstance().signOut();
}
//dispaly chanel data
function showChannelData(data){
  const channelData=document.getElementById('channel-data');
  channelData.innerHTML = data;
}
//get channel from api
function getChannel(channel){
  gapi.client.youtube.channels.list({
    part: 'snippet,contentDetails,statistics',
    forUsername: channel
  })
  .then(response =>{
    console.log(response);
    const channel = response.result.items[0];

    const output = `
    <ul class="collection">
      <li class="collection-item">Title: ${channel.snippet.title}</li>
      <li class="collection-item">ID: ${channel.id}</li>
      <li class="collection-item">Subscribers: ${
        numberWithCommas(channel.statistics.subscriberCount)
      }</li>
      <li class="collection-item">Views: ${
        numberWithCommas(channel.statistics.viewCount)
      }</li>
      li class="collection-item">Videos: ${
        numberWithCommas(channel.statistics.videoCount)
      }</li>
    </ul>
    <p>${channel.snippet.description}</p>
    <hr>
    <a class="btn grey darken-2" target="_blank" href="https://youtube.com/${channel.snippet.customUrl}">Visit Channel</a>
    `;
    showChannelData(output);

    const playlistId = channel.contentDetails.relatedPlaylist.uploads;
    requestVideoPlaylist(playlistId);
  })
  .catch(err => alert('No Channel by that name'));
}
//add commas
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
 function requestVideoPlaylist(playlistId){
const requestOptions={
  playlistId= playlistId,
  part: 'snippet',
  maxResults:10
}

const request= gapi.client.youtube.playlistItems.list(requestOptions);
request.execute(response =>{
  console.log(response);
  const playlistItems= response.result.items;
  if(playlistItems){
   let output ='<br><h4 class ="center-align">Latest Videos</h4>';
   
   //loop thru videos and append output
   playlistItems.forEach(item =>{
    const videoId = item.snippet.resourceId.videoId;

    output+= `
    <div class ="col s3>
    <iframe width="100%" height="auto" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    </div>
    `;
   });

   //output
   videoContainer.innerHTML = output;
   
  } else{
    videoContainer.innerHTML='No Uploaded videos';
  }
});
}








