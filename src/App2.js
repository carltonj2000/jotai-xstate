import { Suspense } from "react";
import { createMachine } from "xstate";
import { inspect } from "@xstate/inspect";
import { atomWithMachine } from "jotai/xstate";
import { useAtom, atom, Provider } from "jotai";

import "./style.css";

inspect();

const initialLightAtom = atom("green");
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

const lightAtom = atomWithMachine(
  (get) => createLightMachine(get(initialLightAtom)),
  { devTools: true }
);

const fetchLightMessage = async (light) => {
  await new Promise((r) => setTimeout(r, 1500));
  return `Hello ${light}`;
};

const asyncMessage = atom(async (get) => {
  const light = get(lightAtom).value;
  const message = await fetchLightMessage(light);
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

const Loader = ({ y = 15 }) => (
  <g>
    <circle fill="gray" cx={110} cy={y}>
      <animate
        attributeName="r"
        values="3;8;4;6;3"
        dur="800ms"
        repeatCount="indefinite"
      />
    </circle>
    <text x={120} y={y + 5}>
      Loading...
    </text>
  </g>
);

const Light = () => {
  const [state, send] = useAtom(lightAtom);

  const handleClick = () => {
    send({ type: "NEXT" });
  };
  return (
    <svg width={200} height={100}>
      <circle fill={state.value} onClick={handleClick} r={40} cx={40} cy={40} />
      <Suspense fallback={<Loader />}>
        <LightMessage />
      </Suspense>
    </svg>
  );
};
function App() {
  return (
    <>
      <div>
        <Provider initialValues={[[initialLightAtom, "yellow"]]}>
          <Light />
          <Light />
          <SetInitialLight />
        </Provider>
      </div>
      <div>
        <Provider>
          <Light />
          <Light />
        </Provider>
      </div>
    </>
  );
}
export default App;

// following does not work due to atom
// due to state machine be created at startup
const SetInitialLight = () => {
  const [, set] = useAtom(initialLightAtom);
  return <button onClick={() => set("red")}>Set red as initial</button>;
};
