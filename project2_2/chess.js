class ChessGame {
    constructor() {
        this.board = this.createInitialBoard();
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.selectedSquare = null;
        this.moveHistory = [];
        this.castlingRights = { white: { king: true, queen: true }, black: { king: true, queen: true } };
        this.enPassantTarget = null;
        this.halfMoveClock = 0;
        this.fullMoveNumber = 1;
        this.gameStatus = 'playing';
        this.winner = null;
        this.repetitions = new Map();
        this.updateRepetition();
    }

    createInitialBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        const pieces = {
            'black': ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
            'white': ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
        };

        for (let col = 0; col < 8; col++) {
            board[0][col] = { type: pieces['black'][col], color: 'black' };
            board[1][col] = { type: '♟', color: 'black' };
            board[6][col] = { type: '♙', color: 'white' };
            board[7][col] = { type: pieces['white'][col], color: 'white' };
        }

        return board;
    }

    getPieceAt(row, col) {
        if (row < 0 || row >= 8 || col < 0 || col >= 8) return null;
        return this.board[row][col];
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.getPieceAt(fromRow, fromCol);
        if (!piece || piece.color !== this.currentPlayer) return false;

        const targetPiece = this.getPieceAt(toRow, toCol);
        if (targetPiece && targetPiece.color === this.currentPlayer) return false;

        const moves = this.getValidMovesForPiece(fromRow, fromCol);
        return moves.some(move => move.row === toRow && move.col === toCol);
    }

    getValidMovesForPiece(row, col) {
        const piece = this.getPieceAt(row, col);
        if (!piece) return [];

        const moves = [];
        const directions = {
            rook: [[-1, 0], [1, 0], [0, -1], [0, 1]],
            bishop: [[-1, -1], [-1, 1], [1, -1], [1, 1]],
            queen: [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]],
            knight: [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]],
            king: [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
        };

        const type = piece.type;
        const color = piece.color;

        if (type === '♙' || type === '♟') {
            const direction = color === 'white' ? -1 : 1;
            const startRow = color === 'white' ? 6 : 1;

            if (this.getPieceAt(row + direction, col) === null) {
                moves.push({ row: row + direction, col });
                if (row === startRow && this.getPieceAt(row + 2 * direction, col) === null) {
                    moves.push({ row: row + 2 * direction, col });
                }
            }

            if (this.getPieceAt(row + direction, col - 1)?.color !== color && this.getPieceAt(row + direction, col - 1) !== null) {
                moves.push({ row: row + direction, col: col - 1 });
            }
            if (this.getPieceAt(row + direction, col + 1)?.color !== color && this.getPieceAt(row + direction, col + 1) !== null) {
                moves.push({ row: row + direction, col: col + 1 });
            }

            if (this.enPassantTarget && this.enPassantTarget.row === row + direction) {
                if (this.enPassantTarget.col === col - 1) {
                    moves.push({ row: row + direction, col: col - 1 });
                }
                if (this.enPassantTarget.col === col + 1) {
                    moves.push({ row: row + direction, col: col + 1 });
                }
            }
        } else if (type === '♘' || type === '♞') {
            for (const [dr, dc] of directions.knight) {
                const newRow = row + dr;
                const newCol = col + dc;
                if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                    const target = this.getPieceAt(newRow, newCol);
                    if (!target || target.color !== color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                }
            }
        } else if (type === '♔' || type === '♚') {
            for (const [dr, dc] of directions.king) {
                const newRow = row + dr;
                const newCol = col + dc;
                if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                    const target = this.getPieceAt(newRow, newCol);
                    if (!target || target.color !== color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                }
            }

            if (this.canCastleKingSide(color)) {
                moves.push({ row: row, col: col + 2 });
            }
            if (this.canCastleQueenSide(color)) {
                moves.push({ row: row, col: col - 2 });
            }
        } else if (type === '♖' || type === '♜' || type === '♗' || type === '♝' || type === '♕' || type === '♛') {
            const dirs = type === '♖' || type === '♜' ? directions.rook :
                        type === '♗' || type === '♝' ? directions.bishop : directions.queen;

            for (const [dr, dc] of dirs) {
                let newRow = row + dr;
                let newCol = col + dc;

                while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                    const target = this.getPieceAt(newRow, newCol);
                    if (!target) {
                        moves.push({ row: newRow, col: newCol });
                    } else {
                        if (target.color !== color) {
                            moves.push({ row: newRow, col: newCol });
                        }
                        break;
                    }
                    newRow += dr;
                    newCol += dc;
                }
            }
        }

        return moves.filter(move => !this.wouldBeInCheck(color, row, col, move.row, move.col));
    }

    wouldBeInCheck(color, fromRow, fromCol, toRow, toCol) {
        const tempBoard = this.board.map(row => [...row]);
        tempBoard[toRow][toCol] = tempBoard[fromRow][fromCol];
        tempBoard[fromRow][fromCol] = null;

        const opponent = color === 'white' ? 'black' : 'white';
        const kingPos = this.findKing(tempBoard, color);

        return this.isSquareAttacked(tempBoard, kingPos.row, kingPos.col, opponent);
    }

    findKing(board, color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && piece.color === color && (piece.type === '♔' || piece.type === '♚')) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    isSquareAttacked(board, row, col, attackerColor) {
        const directions = {
            rook: [[-1, 0], [1, 0], [0, -1], [0, 1]],
            bishop: [[-1, -1], [-1, 1], [1, -1], [1, 1]],
            queen: [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]],
            knight: [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]],
            king: [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
        };

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (!piece || piece.color !== attackerColor) continue;

                const type = piece.type;

                if (type === '♙' || type === '♟') {
                    const direction = attackerColor === 'white' ? -1 : 1;
                    if ((r + direction === row && c - 1 === col) || (r + direction === row && c + 1 === col)) {
                        return true;
                    }
                } else if (type === '♘' || type === '♞') {
                    for (const [dr, dc] of directions.knight) {
                        if (r + dr === row && c + dc === col) return true;
                    }
                } else if (type === '♔' || type === '♚') {
                    for (const [dr, dc] of directions.king) {
                        if (r + dr === row && c + dc === col) return true;
                    }
                } else {
                    const dirs = type === '♖' || type === '♜' ? directions.rook :
                                type === '♗' || type === '♝' ? directions.bishop : directions.queen;

                    for (const [dr, dc] of dirs) {
                        let nr = r + dr;
                        let nc = c + dc;
                        while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                            if (nr === row && nc === col) return true;
                            if (board[nr][nc]) break;
                            nr += dr;
                            nc += dc;
                        }
                    }
                }
            }
        }
        return false;
    }

    isInCheck(color) {
        const kingPos = this.findKing(this.board, color);
        if (!kingPos) return false;
        const opponent = color === 'white' ? 'black' : 'white';
        return this.isSquareAttacked(this.board, kingPos.row, kingPos.col, opponent);
    }

    canCastleKingSide(color) {
        const row = color === 'white' ? 7 : 0;
        if (!this.castlingRights[color].king) return false;
        if (this.getPieceAt(row, 5) || this.getPieceAt(row, 6)) return false;
        if (this.isInCheck(color)) return false;
        if (this.isSquareAttacked(this.board, row, 4, color === 'white' ? 'black' : 'white')) return false;
        if (this.isSquareAttacked(this.board, row, 5, color === 'white' ? 'black' : 'white')) return false;
        return true;
    }

    canCastleQueenSide(color) {
        const row = color === 'white' ? 7 : 0;
        if (!this.castlingRights[color].queen) return false;
        if (this.getPieceAt(row, 1) || this.getPieceAt(row, 2) || this.getPieceAt(row, 3)) return false;
        if (this.isInCheck(color)) return false;
        if (this.isSquareAttacked(this.board, row, 4, color === 'white' ? 'black' : 'white')) return false;
        if (this.isSquareAttacked(this.board, row, 3, color === 'white' ? 'black' : 'white')) return false;
        return true;
    }

    updateCastlingRights(piece, fromCol) {
        if (piece.type === '♔' || piece.type === '♚') {
            this.castlingRights[piece.color].king = false;
            this.castlingRights[piece.color].queen = false;
        } else if (piece.type === '♖' || piece.type === '♜') {
            if (piece.color === 'white') {
                if (fromCol === 0) this.castlingRights.white.queen = false;
                if (fromCol === 7) this.castlingRights.white.king = false;
            } else {
                if (fromCol === 0) this.castlingRights.black.queen = false;
                if (fromCol === 7) this.castlingRights.black.king = false;
            }
        }
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        if (!this.isValidMove(fromRow, fromCol, toRow, toCol)) return false;

        const piece = this.getPieceAt(fromRow, fromCol);
        const targetPiece = this.getPieceAt(toRow, toCol);

        this.moveHistory.push({
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: piece.type,
            captured: targetPiece?.type || null,
            enPassant: this.enPassantTarget?.row === toRow && this.enPassantTarget?.col === toCol,
            castling: (piece.type === '♔' || piece.type === '♚') && Math.abs(fromCol - toCol) === 2
        });

        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        if ((piece.type === '♙' || piece.type === '♟') && Math.abs(fromRow - toRow) === 2) {
            this.enPassantTarget = { row: (fromRow + toRow) / 2, col: fromCol };
        } else {
            this.enPassantTarget = null;
        }

        if (this.enPassantTarget && targetPiece === null && (piece.type === '♙' || piece.type === '♟')) {
            const capturedRow = piece.color === 'white' ? toRow + 1 : toRow - 1;
            this.board[capturedRow][toCol] = null;
        }

        if ((piece.type === '♔' || piece.type === '♚') && Math.abs(fromCol - toCol) === 2) {
            const isKingSide = toCol > fromCol;
            const rookFromCol = isKingSide ? 7 : 0;
            const rookToCol = isKingSide ? toCol - 1 : toCol + 1;
            const rook = this.board[toRow][rookFromCol];
            this.board[toRow][rookToCol] = rook;
            this.board[toRow][rookFromCol] = null;
        }

        this.updateCastlingRights(piece, fromCol);

        if ((piece.type === '♙' && toRow === 0) || (piece.type === '♟' && toRow === 7)) {
            this.board[toRow][toCol] = { type: '♕', color: piece.color };
        }

        this.halfMoveClock = (targetPiece || piece.type === '♙' || piece.type === '♟') ? 0 : this.halfMoveClock + 1;
        if (this.currentPlayer === 'black') {
            this.fullMoveNumber++;
        }

        this.updateRepetition();
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.checkGameEnd();

        return true;
    }

    updateRepetition() {
        const key = this.boardToString();
        this.repetitions.set(key, (this.repetitions.get(key) || 0) + 1);
    }

    boardToString() {
        let str = '';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                str += piece ? piece.type : '.';
            }
        }
        return str + this.currentPlayer;
    }

    checkGameEnd() {
        const opponent = this.currentPlayer;
        const hasValidMoves = this.hasAnyValidMoves(opponent);

        if (!hasValidMoves) {
            if (this.isInCheck(opponent)) {
                this.gameStatus = 'checkmate';
                this.winner = opponent === 'white' ? 'black' : 'white';
            } else {
                this.gameStatus = 'stalemate';
            }
        }

        if (this.halfMoveClock >= 100) {
            this.gameStatus = 'draw_50move';
        }

        for (const [, count] of this.repetitions) {
            if (count >= 3) {
                this.gameStatus = 'draw_repetition';
                break;
            }
        }

        if (!this.hasSufficientMaterial()) {
            this.gameStatus = 'draw_insufficient';
        }
    }

    hasAnyValidMoves(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.getPieceAt(row, col);
                if (piece && piece.color === color) {
                    const moves = this.getValidMovesForPiece(row, col);
                    if (moves.length > 0) return true;
                }
            }
        }
        return false;
    }

    hasSufficientMaterial() {
        let pieces = { white: [], black: [] };
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.getPieceAt(row, col);
                if (piece) {
                    pieces[piece.color].push(piece.type);
                }
            }
        }

        const whiteNonKing = pieces.white.filter(p => p !== '♔');
        const blackNonKing = pieces.black.filter(p => p !== '♚');

        if (whiteNonKing.length === 0 && blackNonKing.length === 0) return false;
        if (whiteNonKing.length === 1 && blackNonKing.length === 0 && (whiteNonKing[0] === '♗' || whiteNonKing[0] === '♘')) return false;
        if (blackNonKing.length === 1 && whiteNonKing.length === 0 && (blackNonKing[0] === '♝' || blackNonKing[0] === '♞')) return false;
        if (whiteNonKing.length === 1 && blackNonKing.length === 1 && 
            ((whiteNonKing[0] === '♗' || whiteNonKing[0] === '♘') && 
             (blackNonKing[0] === '♝' || blackNonKing[0] === '♞'))) return false;

        return true;
    }

    getStatusMessage() {
        switch (this.gameStatus) {
            case 'checkmate':
                return `${this.winner === 'white' ? '白方' : '黑方'}获胜！`;
            case 'stalemate':
                return '无子可动，平局！';
            case 'draw_50move':
                return '50回合规则，平局！';
            case 'draw_repetition':
                return '重复局面，平局！';
            case 'draw_insufficient':
                return '无子可胜，平局！';
            default:
                if (this.isInCheck(this.currentPlayer)) {
                    return `${this.currentPlayer === 'white' ? '白方' : '黑方'}被将军！`;
                }
                return `${this.currentPlayer === 'white' ? '白方' : '黑方'}回合`;
        }
    }

    getLastMove() {
        if (this.moveHistory.length === 0) return null;
        return this.moveHistory[this.moveHistory.length - 1];
    }

    reset() {
        this.board = this.createInitialBoard();
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.selectedSquare = null;
        this.moveHistory = [];
        this.castlingRights = { white: { king: true, queen: true }, black: { king: true, queen: true } };
        this.enPassantTarget = null;
        this.halfMoveClock = 0;
        this.fullMoveNumber = 1;
        this.gameStatus = 'playing';
        this.winner = null;
        this.repetitions = new Map();
        this.updateRepetition();
    }

    undo() {
        if (this.moveHistory.length === 0) return false;

        const lastMove = this.moveHistory.pop();
        const piece = { type: lastMove.piece, color: this.currentPlayer };
        
        this.board[lastMove.from.row][lastMove.from.col] = piece;
        this.board[lastMove.to.row][lastMove.to.col] = lastMove.captured ? { type: lastMove.captured, color: this.currentPlayer === 'white' ? 'black' : 'white' } : null;

        if (lastMove.enPassant) {
            const capturedRow = this.currentPlayer === 'white' ? lastMove.to.row - 1 : lastMove.to.row + 1;
            this.board[capturedRow][lastMove.to.col] = { type: this.currentPlayer === 'white' ? '♙' : '♟', color: this.currentPlayer };
        }

        if (lastMove.castling) {
            const isKingSide = lastMove.to.col > lastMove.from.col;
            const rookFromCol = isKingSide ? lastMove.to.col - 1 : lastMove.to.col + 1;
            const rookToCol = isKingSide ? 7 : 0;
            const rookType = this.currentPlayer === 'white' ? '♖' : '♜';
            this.board[lastMove.to.row][rookToCol] = { type: rookType, color: this.currentPlayer };
            this.board[lastMove.to.row][rookFromCol] = null;
        }

        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.gameStatus = 'playing';
        this.winner = null;

        return true;
    }
}