const createStore = function(reducer, initState) {
  let state = initState;
  let listeners = [];

  function subscribe(listener) {
    listeners.push(listener);
  }

  function dispatch(action) {
    state = reducer(state, action);
    for (let i = 0; i < listeners.length; i++) {
      listeners[i]();
    }
  }

  function getState() {
    return state;
  }

  return {
    subscribe,
    dispatch,
    getState
  }
}

function reducer(state, action) {
  switch (action.type) {
    case "INCREMENT":
      return {
        ...state,
        count: state.count + action.payload
      }
    case "DECREMENT":
      return {
        ...state,
        count: state.count - action.payload
      }
    default:
      return state;
  }
}

// use this state management
const initState = { count: 0 };
let store = createStore(reducer, initState);

store.subscribe(() => {
  console.log("count:", store.getState().count);
});

store.dispatch({
  type: 'INCREMENT',
  payload: 2
})

store.dispatch({
  type: 'DECREMENT',
  payload: 1
})

// React useReducer（when states get huge）
/* 
  const [something, setSomething] = useState('apple')
  --->
  const [state, dispatch] = useReducer(reducer, { something: 'apple' })
*/
function useMySpecialReducer() {
  const [state, dispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case "TOGGLE_DARK_MODE": {
          return {
            ...state,
            darkMode: !state.darkMode
          };
        }
        case "NAME_CHARACTER": {
          return {
            ...state,
            name: action.name,
            error:
              action.name.length > 15
                ? "That name is way too long, bucko"
                : null
          };
        }
        case "RANDOM_VALUES": {
          return {
            ...state,
            name: randomName()
          };
        }
        case "DISMISS_ERROR": {
          return { 
            ...state,
            error: null
          };
        }
        default: {
          return state;
        }
      }
    },
    {
      darkMode: false,
      name: "",
      error: null
    }
  );
  return [state, dispatch];
}

export default function App() {
  const [
    { darkMode, name, error },
    dispatch
  ] = useMySpecialReducer();

  return (
    <div className={`App ${darkMode ? "darkmode" : ""}`}>
      <button
        onClick={() => {
          dispatch({ type: "TOGGLE_DARK_MODE" });
        }}
      >
        Dark Mode {darkMode ? "ON" : "OFF"}
      </button>
      <br />
      <input
        type="text"
        placeholder="Type your name"
        value={name}
        onChange={event => {
          dispatch({
            type: "NAME_CHARACTER",
            name: event.target.value
          });
        }}
      />
      {error && (
        <div className="error">
          {error}
          <button
            onClick={() => {
              dispatch({ type: "DISMISS_ERROR" });
            }}
          >
            Dismiss
          </button>
        </div>
      )}
      <div className="sheet">
        <h2>Name: {name}</h2>
      </div>
      <button
        onClick={() => {
          dispatch({ type: "RANDOM_VALUES" });
        }}
      >
        Do it all for me instead
      </button>
    </div>
  );
}
