const express = require("express");
const router = express();

const users = [
  {
    id: 1,
    full_name: "Kendre Abelevitz",
  },
  {
    id: 2,
    full_name: "Rona Walas",
  },
  {
    id: 3,
    full_name: "Myrtle Baser",
  },
  {
    id: 4,
    full_name: "Washington Walklot",
  },
  {
    id: 5,
    full_name: "Jo De Domenici",
  },
  {
    id: 6,
    full_name: "Lief Mungham",
  },
  {
    id: 7,
    full_name: "Raquel Donlon",
  },
  {
    id: 8,
    full_name: "Vivien Wedmore.",
  },
  {
    id: 9,
    full_name: "Andrei Hubach",
  },
  {
    id: 10,
    full_name: "Coral Bunney",
  },
  {
    id: 11,
    full_name: "Lanny Simco",
  },
  {
    id: 12,
    full_name: "Loralie Bransdon",
  },
  {
    id: 13,
    full_name: "Rad Aubert",
  },
  {
    id: 14,
    full_name: "Kit Branno",
  },
  {
    id: 15,
    full_name: "Quillan Bondar",
  },
  {
    id: 16,
    full_name: "Averil Dafforne",
  },
  {
    id: 17,
    full_name: "Caroljean Grattan",
  },
  {
    id: 18,
    full_name: "Abbie McCurtin",
  },
  {
    id: 19,
    full_name: "Rosalia Plowell",
  },
  {
    id: 20,
    full_name: "Juli Grieve",
  },
];

function paginatedResults(model) {
  // middleware function
  return (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    // calculating the starting and ending index
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};
    if (endIndex < model.length) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }

    results.results = model.slice(startIndex, endIndex);

    res.paginatedResults = results;
    next();
  };
}

// get all results
router.get("/users", (req, res) => {
  res.json(users);
});

// get paginated results
router.get("/users/paginate", paginatedResults(users), (req, res) => {
  res.json(res.paginatedResults);
});

module.exports = router;

// Redux:
const ADD = "ADD";

const addMessage = (message) => {
  return {
    type: ADD,
    message: message,
  };
};

const messageReducer = (state = [], action) => {
  switch (action.type) {
    case ADD:
      return [...state, action.message];
    default:
      return state;
  }
};

const store = Redux.createStore(messageReducer);

// React:
class Presentational extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input: "",
    };
    this.handleChange = this.handleChange.bind(this);
    this.submitMessage = this.submitMessage.bind(this);
  }
  handleChange(event) {
    this.setState({
      input: event.target.value,
    });
  }
  submitMessage() {
    this.props.submitNewMessage(this.state.input);
    this.setState({
      input: "",
    });
  }
  render() {
    return (
      <div>
        <h2>Type in a new Message:</h2>
        <input value={this.state.input} onChange={this.handleChange} />
        <br />
        <button onClick={this.submitMessage}>Submit</button>
        <ul>
          {this.props.messages.map((message, idx) => {
            return <li key={idx}>{message}</li>;
          })}
        </ul>
      </div>
    );
  }
}

// React-Redux
const Provider = ReactRedux.Provider;
const connect = ReactRedux.connect;

const mapStateToProps = (state) => {
  return { messages: state };
};

const mapDispatchToProps = (dispatch) => {
  return {
    submitNewMessage: (message) => {
      dispatch(addMessage(message));
    },
  };
};

const Container = connect(mapStateToProps, mapDispatchToProps)(Presentational);

class AppWrapper extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <Container />
      </Provider>
    );
  }
}

ReactDOM.render(<AppWrapper />, document.getElementById("app"));

/*********
 * REACT
 **********/

/* Create Counter component which takes value, onIncrement, and onDecrement as its parameters */
const Counter = ({ value, onIncrement, onDecrement, onReset }) => (
  <div id="counter-app">
    <div id="display-container" className="container">
      <p id="display">{value}</p>
    </div>
    <div id="buttons-container" className="container">
      <button id="increment-button" className="button" onClick={onIncrement}>
        <i className="fa fa-plus"></i>
      </button>
      <button id="decrement-button" className="button" onClick={onDecrement}>
        <i className="fa fa-minus"></i>
      </button>
      <button id="reset-button" className="button" onClick={onReset}>
        <i className="fa fa-refresh"></i>
      </button>
    </div>
  </div>
);

/* Wrapper function for ReactDOM.render functionality for the app */
const render = () => {
  ReactDOM.render(
    <Counter
      value={store.getState()}
      onIncrement={() => {
        const val = store.getState();
        if (val < 99) {
          store.dispatch({
            type: "INCREMENT",
          });
        }
      }}
      onDecrement={() => {
        const val = store.getState();
        if (val > 0) {
          store.dispatch({
            type: "DECREMENT",
          });
        }
      }}
      onReset={() => {
        store.dispatch({
          type: "RESET",
        });
      }}
    />,
    document.getElementById("react-root")
  );
};

/*********
 * REDUX
 **********/

/* counter takes a default value for state, and an action */
const counter = (state = 0, action) => {
  switch (action.type) {
    case "INCREMENT":
      return state + 1;
    case "DECREMENT":
      return state - 1;
    case "RESET":
      return 0;
    default:
      return state;
  }
};

/* Import { createStore } from 'redux' */
const { createStore } = Redux;
/* store uses counter as its reducer */
const store = createStore(counter);

/* When the state in store changes, use this function */
store.subscribe(render);

/* Initial render */
render();
