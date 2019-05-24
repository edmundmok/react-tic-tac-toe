import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button
      className="square"
      onClick={props.onClick}
      style={{ 'backgroundColor': props.isWinningSquare ? 'yellow' : '' }}
    >
      {props.value}
    </button>
  )
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        key={i}
        isWinningSquare={this.props.winningSquares && this.props.winningSquares.includes(i)}
        value={this.props.squares[i]}
        onClick={() => this.props.handleClick(i)}
      />
    );
  }

  render() {
    var boardItems = []
    for (let row = 0; row < 3; row++) {
      var rowItems = []
      for (let col = 0; col < 3; col++) {
        rowItems.push(this.renderSquare(row * 3 + col));
      }
      boardItems.push(<div key={row} className="board-row">{rowItems}</div>)
    }

    return (
      <div>
        {boardItems}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        moveRow: null,
        moveCol: null
      }],
      stepNumber: 0,
      xIsNext: true,
      historyAscOrder: true,
    }
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winningSquares = calculateWinningSquares(current.squares);
    const winner = winningSquares ? current.squares[winningSquares[0]] : null;
    const isDraw = !winner && !current.squares.includes(null);

    const moves = history.map((step, move) => {
      const desc = move ?
        ('Go to move #' + move + ' @ (' + step.moveRow + ', ' + step.moveCol + ')') :
        'Go to game start';
      const isSelectedMove = move === this.state.stepNumber;

      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>
            {isSelectedMove ? (<b>{desc}</b>) : desc}
          </button>
        </li>
      );
    });

    if (!this.state.historyAscOrder) moves.reverse();

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else if (isDraw) {
      status = 'Draw!'
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    let sortOrder = 'Sorted by ' + (this.state.historyAscOrder ? 'ascending' : 'descending') + ' order'

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            winningSquares={winningSquares}
            handleClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div>
            <button
              onClick={() => this.handleSortToggle()}
            >
              {sortOrder}
            </button>
          </div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }

  handleSortToggle() {
    this.setState((state, props) => ({
      historyAscOrder: !state.historyAscOrder
    }));
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinningSquares(squares) || squares[i]) {
      return;
    }

    const rowNum = Math.floor(i / 3);
    const colNum = i % 3;

    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState((state, props) => ({
      history: history.concat([{
        squares: squares,
        moveRow: rowNum,
        moveCol: colNum
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    }));
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }
}

// ========================================

function calculateWinningSquares(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return lines[i];
    }
  }
  return null;
}

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
