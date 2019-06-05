var black = 1,
	white = 2, 
	empty = 0, 
	outer = '?';

var up = 0,
	right = 0, 
	down = 0,
	left = 0,
	upRight = -9,
	downRight = 11,
	downLeft = 9,
	upLeft = -11;

directions = [up, upRight, right, downRight, down, downLeft, left, upLeft];

players = {black: 'Black', white: 'White'}

squareWeight = [
    0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
    0, 120, -20,  20,   5,   5,  20, -20, 120,   0,
    0, -20, -40,  -5,  -5,  -5,  -5, -40, -20,   0,
    0,  20,  -5,  15,   3,   3,  15,  -5,  20,   0,
    0,   5,  -5,   3,   3,   3,   3,  -5,   5,   0,
    0,   5,  -5,   3,   3,   3,   3,  -5,   5,   0,
    0,  20,  -5,  15,   3,   3,  15,  -5,  20,   0,
    0, -20, -40,  -5,  -5,  -5,  -5, -40, -20,   0,
    0, 120, -20,  20,   5,   5,  20, -20, 120,   0,
    0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
];

maxValue =  sumAbs(squareWeight);
minValue =  -maxValue;

function enemy(player) {
	if (player == white)
		return black;
	else
		return white;
}

function boardIndex() {
	var arrayIndex = []
	for (var i = 11; i <= 89; i++) {
		if ((i % 10) >= 1 && (i % 10) <= 8) {
			arrayIndex.push(i);
		}
	}
	return arrayIndex  
}

function anyLegalMove() {
	for (var index in boardIndex) {
		return any(isLegal(index, player, board))
	}
}

function hasBracket(directions) {
	return findBracket(move, player, board, direction);
}

function isLegal(move, player, board) {
	return board[move] == EMPTY && any(directions.map(hasBracket))
}

function findBracket(square, player, board, direction) {
	var bracket = square + direction;
    if (board[bracket] == player)
        return null
    opp = enemy(player)
    while (board[bracket] == opp) {
        bracket += direction;
    }
    if (board[bracket] in [outer, empty])
    	return null;
    else 
    	return bracket
}

function legalMoves(player, board) {
	var legalMoves = [];
	for (index in boardIndex) {
		if (isLegal(index, player, board))
			legalMoves.push(index);
	}
	return legalMoves;
}

exports.weightedScore = function(player, board) {
	var enemys = enemy(player);
	var total = 0;
	for (index in boardIndex()) {
		if (board[index] == player)
			total += squareWeight[index];
		else if (board[index] == enemys)
			total -= squareWeight[index];
	}
	return total;
}

exports.score = function(player, board) {
	var mine = 0, 
		theirs = 0,
        enemys = enemy(player);
    for (index in boardIndex()) {
        var piece = board[index];
        if (piece == player)
            mine += 1;
        else if (piece == enemys)
            theirs += 1
    }
    return mine - theirs
}

function finalValue(player, board) {
	var diff = score(player, board);
	if (diff < 0)
		return minValue
	else if (diff > 0)
		return maxValue
	return diff
}

function makeMove(move, player, board) {
	board[move] = player;
	for (d in directions) {
		makeFlips(move, player, board, d)
	}
	return board
}

/*
def make_flips(move, player, board, direction):
    """
        Funcion que permite hacer el cambio de las fichas en la direccion especificado
        como resultado de aplicar un movimiento
    """
    bracket = find_bracket(move, player, board, direction)
    if not bracket:
        return
    square = move + direction
    while square != bracket:
        board[square] = player
        square += direction
*/

function makeFlips(move, player, board, direction) {
 	var bracket = findBracket(move, player, board, direction);
 	if (!bracket)
        return
    var square = move + direction;
    while (square != bracket) {
        board[square] = player;
        square += direction;
    }
 }

function minimax(player, board, depth, evaluate) {
	max = [];
	function value(board) {
		return -minimax(enemy(player), board, depth - 1, evaluate)[0]
	}
	if (depth == 0)
        return evaluate(player, board), null;
    var moves = legalMoves(player, board);
    if (!moves) {
    	if (!anyLegalMove(enemy(player), board))
            return finalValue(player, board), null
        return value(board), null
    }
    for (m in moves) {
    	max.push(Math.max((value(make_move(m, player, list(board)))), m))
    }
    return Math.max.apply(null, max)
}

function alphabeta(player, board, alpha, beta, depth, evaluate) {
	console.log("entro " + depth)
	if (depth == 0)
        return evaluate(player, board), null;
    function value(board, alpha, beta) {
    	return -alphabeta(opponent(player), board, -beta, -alpha, depth-1, evaluate)[0]
    }

    var moves = legalMoves(player, board)
    if (!moves) {
        if (!any_legal_move(enemy(player), board))
            return final_value(player, board), null
        return value(board, alpha, beta), null
    }

    var bestMove = moves[0];
    for (move in moves) {
        if (alpha >= beta)
            break
        var val = value(makeMove(move, player, list(board)), alpha, beta)
        if (val > alpha) {
        	alpha = val
            bestMove = move
        }
    }
    console.log("llego");

    return [alpha, bestMove]
}

function isValid(move) {
	return Number.isInteger(move) && move in squares()
}

exports.getMove = function(strategy, player, board) {
	var copy = list(board);
    var move = strategy(player, copy)
    if (!isValid(move) || !isLegal(move, player, board))
        console.log("error3")
    return move;
}

/*
def alphabeta_searcher(depth, evaluate):
    """f
        Construye la estrategia a utilizar (ALPHA-BETA) con el depth y la heuristica
        especificada
    """
    def strategy(player, board):
        return alphabeta(player, board, MIN_VALUE, MAX_VALUE, depth, evaluate)[1]
    return strategy
*/
exports.minimaxSearcher = function(depth, evaluate) {
	var strategy = function(player, board) {
		return minimax(player, board, depth, evaluate)[1]
	}
	return strategy
}

exports.alphabetaSearcher = function(depth, evaluate) {
	var strategy = function(player, board) {
		return alphabeta(player, board, minValue, maxValue, depth, evaluate)[1];
	}
	return strategy;
}

exports.parseBoard = function(serverBoard) {
    myBoard = [];
    for (var i = 0; i < 100; i++) {
    	myBoard.push(outer);
    }
    serverBoardPos = 0;
    for (i in boardIndex()) {
        myBoard[i] = serverBoard[serverBoardPos]
        serverBoardPos += 1
    }
    return myBoard;
}

exports.parseMove = function(move) {
    if (move >= 11 && move <= 18) 
        return move - 11
    else if (move >= 21 && move <= 28)
        return move - 13
    else if (move >= 31 && move <= 38)
        return move - 15
    else if (move >= 41 && move <= 48)
        return move - 17
    else if (move >= 51 && move <= 58)
        return move - 19
    else if (move >= 61 && move <= 68)
        return move - 21
    else if (move >= 71 && move <= 78)
        return move - 23
    else if (move >= 81 && move <= 88)
        return move - 25
}

exports.pickStrategy = function(N, ndice, nsix) {
    M = 0;
    for (var i=0; i<N; i++) {
        alpha = 0;              
        for (var ii=0; ii<N; ii++) {
            r = Math.floor(Math.random() * 2) + 1;
            if (r == 1)
                alpha += 1
        }
        if (alpha >= nsix)      
            M += 1
    }
    p = parseFloat(M) / N;
    return p
}

exports.pickHeuristic = function(N, ndice, nsix) {
    M = 0;
    for (var i=0; i<N; i++) {
        score = 0;              
        for (var ii=0; ii<N; ii++) {
            r = Math.floor(Math.random() * 2) + 1;
            if (r == 1)
                score += 1
        }
        if (score >= nsix)      
            M += 1
    }
    p = parseFloat(M) / N
    return p
}

//recursos
function any(iterable) {
    for (var index = 0; index < iterable.length; index++) {
        if (iterable[index]) return true;
    }
    return false;
}

function sumAbs(arr) {
	var result = 0, n = arr.length || 0;
  	while(n--) {
    	result += +Math.abs(arr[n]);
  	}
  	return result;
}

function list(iterable) {
  return [...iterable];  
}