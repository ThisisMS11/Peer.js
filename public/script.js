const socket = io('/')

// if we don't mention the host and port here then this will connect to the official peer cloud server.
const myPeer = new Peer()
const videoGrid = document.getElementById('video-grid')


const myVideo = document.createElement('video')
myVideo.muted = true;

// to keep a hold of all of our peers.
const peers = {}

// getUserMedia API to request access to the user's webcam and microphone. If access is granted, the user's video and audio stream are obtained, and the addVideoStream function is called to display the video stream in the myVideo element.
navigator.mediaDevices.getUserMedia({
    video :true,
    audio:true
}).then(stream =>{
    addVideoStream(myVideo,stream)


    // when a peer tries to call us, we want to return stream as our answer.
    myPeer.on('call',call=>{
        
        call.answer(stream)

        // to respond to any video stream that is coming in.
        const video = document.createElement('video')
        call.on('stream',userVideoStream=>{
            addVideoStream(video,userVideoStream)
        })
    })

    // allowing ourselves to connect to other users stream
    socket.on('user-connected',userId =>{
        connectToNewUser(userId,stream)
    })
})


socket.on('user-disconnected',userId =>{
    if(peers[userId])
        peers[userId].close()
})

function connectToNewUser(userId,stream){

    // this call is to identify the user with userId and pass it to him our stream.
    const call = myPeer.call(userId,stream)

    // element which will hold the video data.
    const video = document.createElement('video')

    // to handle other user's stream data 
    call.on('stream',userVideoStream =>{
        addVideoStream(video,userVideoStream)
    })

    // when user disconnects.
    call.on('close',()=>{
        video.remove()
    })

    peers[userId] = call;
}


myPeer.on('open',(userId)=>{
    socket.emit('join-room',ROOM_ID,userId)
})


function addVideoStream(video,stream){
    video.srcObject = stream
    video.addEventListener('loadedmetadata',()=>{
        video.play()
    })

    videoGrid.append(video)
}