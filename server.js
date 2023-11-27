const express = require('express');
require('dotenv').config();
const PORT  = process.env.PORT || 8001;
console.log(PORT)
const app = express();
const server = require('http').Server(app)
const io = require('socket.io')(server)
const {v4 : uuidV4} = require('uuid')

app.set('view engine','ejs')
app.use(express.static('public'))

app.get('/',(req,res)=>{
    res.redirect(`/${uuidV4()}`)
})

app.get('/:room',(req,res)=>{
    /* this will render my room.ejs file in views folder */
    res.render('room',{roomId : req.params.room})
})

io.on('connection', socket =>{
    socket.on('join-room',(roomId,userId)=>{
        console.log({roomId,userId})
        socket.join(roomId)

        io.to(roomId).emit('user-connected',userId)

        socket.on('disconnect',()=>{
            io.to(roomId).emit('user-disconnected',userId)
        })
    })
})

server.listen(PORT,()=>{
    console.log("Server is listening at Port no. ",PORT);
})