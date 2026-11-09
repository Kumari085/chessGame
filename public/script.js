import { Chess } from 'https://cdn.jsdelivr.net/npm/chess.js@1.4.0/+esm';
const boardElement = document.querySelector('.chessboard');
const playerRoleElement = document.getElementById('player-role');

let playerRole = null;
let moveHistory = [];

const chess = new Chess();
const socket = window.io();

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";
    playerRoleElement.innerText = playerRole ? (playerRole === 'w' ? 'White' : 'Black') : 'Spectator';
    board.forEach((row, rowIndex) => {
        row.forEach((square, colIndex) => {
            const squareElement = document.createElement('div');
            squareElement.classList.add("square", (rowIndex + colIndex) % 2 === 0 ? 'white' : 'black');

            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = colIndex;

            if (square) {
                const pieceElement = document.createElement('div');
                pieceElement.classList.add('piece', square.color === 'w' ? 'white' : 'black');

                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener('dragstart', (e) => {
                    if (pieceElement.draggable) {
                        e.dataTransfer.setData('text/plain', `${rowIndex},${colIndex}`);
                    }
                });

                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            squareElement.addEventListener('drop', (e) => {
                e.preventDefault();
                const source = e.dataTransfer.getData('text/plain');
                if (source) {
                    const [sourceRow, sourceCol] = source.split(',').map(Number);
                    const targetSquare = {
                        row: Number(squareElement.dataset.row),
                        col: Number(squareElement.dataset.col)
                    };

                    handleMove({ row: sourceRow, col: sourceCol }, targetSquare);
                }
            });

            boardElement.appendChild(squareElement);
        });
    });
};

const handleMove = (source,target)=>{
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: 'q' // Default promotion to queen
    }

    socket.emit('move',move);
}
const getPieceUnicode = (piece) => {
    const unicodePieces = {
        w: {
            p: '♙',
            r: '♖',
            n: '♘',
            b: '♗',
            q: '♕',
            k: '♔'
        },
        b: {
            p: '♟',
            r: '♜',
            n: '♞',
            b: '♝',
            q: '♛',
            k: '♚'
        }
    };

    if (!piece || !unicodePieces[piece.color]) {
        return '';
    }

    return unicodePieces[piece.color][piece.type] || '';
}


socket.on('playerRole',(role)=>{
    playerRole = role==='white'? 'w':'b';
       renderBoard();
})
socket.on('spectatorRole',()=>{
    playerRole = null;
    renderBoard();
})

const renderCapturedPieces = () => {
    const { whiteCaptured, blackCaptured } = getCapturedPieces();

    const whiteContainer = document.getElementById('white-captured');
    const blackContainer = document.getElementById('black-captured');

    const renderPieces = (container, pieces) => {
        container.replaceChildren(...pieces.map((piece) => {
            const pieceElement = document.createElement('span');
            pieceElement.classList.add('captured-piece', piece.color === 'w' ? 'white' : 'black');
            pieceElement.textContent = getPieceUnicode(piece);
            return pieceElement;
        }));
    };

    renderPieces(whiteContainer, whiteCaptured);
    renderPieces(blackContainer, blackCaptured);
};

 const getCapturedPieces = ()=>{
    const whiteCaptured = [];
    const blackCaptured = [];
    
      moveHistory.forEach((move)=>{
          if(move.captured){
                if(move.color === 'w'){
                    whiteCaptured.push({
                        color: 'b',
                        type:move.captured
                    })
                    
                } else{
                    blackCaptured.push({
                        color: 'w',
                        type:move.captured
                    })
                }
          }
      })

      return {whiteCaptured,blackCaptured};
 }

socket.on('boardState',(boardState)=>{
    chess.load(boardState.fen);
   

   moveHistory = boardState.history || [];
    renderBoard();
   renderCapturedPieces();
    // renderCapturedPieces();
});

socket.on('moveRejected', (reason) => {
    console.warn('Move was rejected:', reason);
});

socket.on('move',(move)=>{
    chess.move(move);
    renderBoard();
});
renderBoard();