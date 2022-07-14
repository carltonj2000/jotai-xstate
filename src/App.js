import { createMachine } from "xstate";
import { atomWithMachine } from "jotai/xstate";
import { useAtom, atom, Provider } from "jotai";

import "./style.css";
import { useEffect } from "react";

const createLightMachine = (initial = "green") =>
  createMachine({
    id: "lightMachine",
    initial,
    states: {
      green: { on: { NEXT: "yellow" } },
      yellow: { on: { NEXT: "red" } },
      red: { on: { NEXT: "green" } },
    },
  });

const createLightAtom = (initial) =>
  atomWithMachine(() => createLightMachine(initial), {
    devTools: true,
  });

const lightAtomAtom = atom(createLightAtom("red"));

const fetchLightMessage = (light) => {
  return `Hello ${light}`;
};

const asyncMessage = atom((get) => {
  const lightAtom = get(lightAtomAtom);
  const light = get(lightAtom).value;
  const message = fetchLightMessage(light);
  return message;
});

const LightMessage = () => {
  const [message] = useAtom(asyncMessage);
  return (
    <text x={100} y={20}>
      {message}
    </text>
  );
};

const Light = ({ initial = "red" }) => {
  const [lightAtom, setLightAtom] = useAtom(lightAtomAtom);
  useEffect(() => {
    setLightAtom(createLightAtom(initial));
  }, [initial, setLightAtom]);
  const [state, send] = useAtom(lightAtom);

  const handleClick = () => {
    send({ type: "NEXT" });
  };
  return (
    <svg width={200} height={100}>
      <circle fill={state.value} onClick={handleClick} r={40} cx={40} cy={40} />
      <LightMessage />
    </svg>
  );
};
function App() {
  return (
    <>
      <div>
        <Provider>
          <Light initial="green" />
        </Provider>
      </div>
      <div>
        <Provider>
          <Light initial="red" />
        </Provider>
      </div>
    </>
  );
}
export default App;
