// client.js
// Implementación del protocolo.

const myModule = require('./intelligence');
var numTiros=0;
var socket;

var io = require('socket.io-client')  

start();

function start(){
    socket = io.connect('http://localhost:4000', {reconnect: true});

    socket.on('connect',function(){
        console.log("Conectado.");
        socket.emit("signin",{game:"othello",user_name:"jp19",tournament_id:12,user_role:"player"});

    });

    socket.on('ok_signin',function(data){

        console.log("Signin succesful. Waiting for ready....");
    });

    socket.on('error_signin',function(data){
        console.log("Connection Error.");
    });

    socket.on('ready',function(data){
        var board = data["board"];
        var player = data["player_turn_id"];
        var newBoard = myModule.parseBoard(board);
        var strategyPicked = myModule.pickStrategy(30, 30, 15);
        var heuristicPicked = myModule.pickHeuristic(30, 30, 15);
        if (heuristicPicked < 0.5)
            var heuristic = myModule.weightedScore(player,board)
        else
            var heuristic = myModule.score(player,board);
        if (strategyPicked < 0.5)
            strategy = myModule.minimaxSearcher(4, heuristic)
        else
            strategy = myModule.alphabetaSearcher(5, heuristic)
        var move = myModule.getMove(strategy, player, newBoard)
        var moveParsed = myModule.parseMove(move)
        socket.emit(
            'play',
            {
                tournament_id: 12,
                player_turn_id: data.player_turn_id,
                game_id: data.game_id,
                movement: moveParsed
            }
        )
    });

    socket.on("finish",function(data){
        socket.emit('player_ready', {tournament_id: 12, player_turn_id: data.player_turn_id, game_id: data.game_id})
    });

};