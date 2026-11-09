const express=require('express');
const app=express();
const socket=require('socket.io');
const http=require('http');
const path=require('path');
const server=http.createServer(app);
const io=socket(server);    
const {Chess}=require('chess.js');
const chess = new Chess();
const player = {};
const currenPlayer = 'w';

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'public')));

io.on('connection',(socket)=>{
    console.log('connected');

    if(!player.white){
        player.white=socket.id;
        socket.emit('playerRole','white');
    }else if(!player.black){
        player.black=socket.id;
        socket.emit('playerRole','black');
    }else{
        socket.emit('spectatorRole');
    }
socket.emit('boardState',{
                        fen: chess.fen(),
                        history: chess.history({ verbose: true })
                    });
    socket.on('disconnect',()=>{
        if(player.white===socket.id){
            delete player.white;
        }else if(player.black===socket.id){
            delete player.black;
        }
    })

    socket.on('move',(move)=>{
       try{
                if(chess.turn()==='w'&&socket.id!==player.white){
                    socket.emit('moveRejected', "It is White's turn.");
                    return;
                }
                if(chess.turn()==='b'&&socket.id!==player.black){
                    socket.emit('moveRejected', "It is Black's turn.");
                    return;
                }
                const result=chess.move(move);
                if(result){
                    io.emit('boardState',{
                        fen: chess.fen(),
                        history: chess.history({ verbose: true })
                    });
                }else{
                    console.log('invalid move',move);
                    socket.emit('moveRejected', 'That is not a legal move.');
}

       }catch(err){
           console.log(err);
           socket.emit('error',err.message);

       }
    })
    
})

app.get('/',(req,res)=>{
    res.render('index');
})

server.listen(3000, () => {
    console.log("Server is running on port 3000");
});