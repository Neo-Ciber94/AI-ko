# react-declare-events

Emit and listen events in any place in your react tree.

> Keep in mind this is not an state management library.

## Install

```bash
# npm
npm install react-declare-events
```

```bash
# yarn
yarn add react-declare-events
```

```bash
# pnpm
pnpm add react-declare-events
```

## Usage

Define your events in a typescript object.

```ts
// events.ts

const { eventEmitter, eventListener } = declareEvents<{
  userNameChanged: { newName: string };
  exit: void;
}>();
```

Listen to the events in any component

```tsx
import { eventListener } from "@/events";

function UserProfile() {
  eventListener.userNameChanged.useSubscription(({ newName }) => {
    alert("User name was changed to " + newName);
  });

  eventListener.exit.useSubscription(() => {
    if (confirm("Are you sure you want to close the app?")) {
      // do something
    }
  });

  return <div>{/* jsx */}</div>;
}
```

Emit events from any component

```tsx
import { eventEmitter } from "@/events";

function ExitButton() {
  return <button onClick={() => eventEmitter.exit()}>Exit</button>;
}
```
