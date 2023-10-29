import runner from '../../../../../Users/inmth/eclipse-workspace/wc_and_xslt/saxon-runner.js';
class MyComponent extends HTMLElement {
	#root;
	constructor() {
		super();
		this.#root = this.attachShadow({ mode: "closed" });
		this.#root.appendChild(document.querySelector("#template").content);
		this.#root.querySelector("#button").onclick = () =>
			this.#handleClick();
	}

	#handleClick() {
		alert("Click");
	}
}

customElements.define("my-component", MyComponent);

class SquareComponent extends HTMLElement {
	constructor() {
		super();
		this.root = this.attachShadow({ mode: "closed" });
		this.root.innerHTML = `
		<style>
		  button {
			background: #fff;
			border: 1px solid #999;
			float: left;
			font-size: 24px;
			font-weight: bold;
			line-height: 34px;
			height: 34px;
			margin-right: -1px;
			margin-top: -1px;
			padding: 0;
			text-align: center;
			width: 34px;
		  }
		</style>
		<button></button>
	  `;
	}

	setProps(props) {
		this.props = props;
		this.update();
	}

	update() {
		this.root.querySelector("button").innerHTML = this.props.value || "";
		this.root.querySelector("button").onclick = this.props.onClick;
	}
}

customElements.define("square-component", SquareComponent);
class BoardComponent extends HTMLElement {
	constructor() {
		super();
		this.root = this.attachShadow({ mode: "closed" });
		this.root.appendChild(document.getElementById("board-template").content);
	}

	setProps(props) {
		this.props = props;
		this.update();
	}

	update() {
		this.root.querySelectorAll("square-component").forEach((elm, i) => {
			elm.setProps({
				value: this.props.squares[i],
				onClick: () => this.props.onClick(i)
			});
		});
	}
}

customElements.define("board-component", BoardComponent);
class GameComponent extends HTMLElement {
	constructor() {
		super();
		this.state = {
			history: [
				{
					squares: Array(9).fill(null)
				}
			],
			stepNumber: 0,
			xIsNext: true
		};
		this.root = this.attachShadow({ mode: "closed" });
		this.root.appendChild(document.getElementById("game-template").content);
		this.update();
	}

	setState(state) {
		this.state = { ...this.state, ...state };
		this.update();
	}

	handleClick(i) {
		const history = this.state.history.slice(0, this.state.stepNumber + 1);
		const current = history[history.length - 1];
		const squares = current.squares.slice();
		if (calculateWinner(squares) || squares[i]) {
			return;
		}
		squares[i] = this.state.xIsNext ? "X" : "O";
		this.setState({
			history: history.concat([
				{
					squares: squares
				}
			]),
			stepNumber: history.length,
			xIsNext: !this.state.xIsNext
		});
	}

	jumpTo(step) {
		this.setState({
			stepNumber: step,
			xIsNext: (step % 2) === 0
		});
	}

	update() {
		const history = this.state.history;
		const current = history[this.state.stepNumber];
		const winner = calculateWinner(current.squares);

		const moves = history.map((step, move) => {
			const desc = move ?
				'Go to move #' + move :
				'Go to game start';
			const fragment = document.createRange().createContextualFragment(`
		  <li>
			<button>${desc}</button>
		  </li>
		`);
			fragment.querySelector("button").onclick = () => {
				this.jumpTo(move);
			}
			return fragment;
		});

		let status;
		if (winner) {
			status = "Winner: " + winner;
		} else {
			status = "Next player: " + (this.state.xIsNext ? "X" : "O");
		}
		this.root.querySelector("board-component").setProps({
			squares: current.squares,
			onClick: (i) => this.handleClick(i)
		});
		this.root.querySelector(".game-info > div").innerHTML = status;
		this.root.querySelector(".game-info > ol").replaceChildren(...moves);
	}
}

customElements.define("game-component", GameComponent);

function calculateWinner(squares) {
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
	const length = lines.length;
	for (let i = 0; i < length; i++) {
		const [a, b, c] = lines[i];
		const player = squares[a];
		if (player && player === squares[b] && player === squares[c]) {
			return player;
		}
	}
	return null;
}