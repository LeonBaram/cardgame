// import { AnyEvent } from "../../models";

const roomID: string = window.location.pathname.match(/\/(.+?)\//)![1];

const socket = new WebSocket(`ws://localhost:3000?roomID=${roomID}`);

console.log({ roomID });

document.querySelector("p")!.innerHTML = roomID;
