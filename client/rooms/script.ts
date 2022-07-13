const { pathname } = window.location;

const roomID: string = pathname.match(/rooms\/(.+?)\//)![1];

const socket = new WebSocket(`ws://localhost:3000?roomID=${roomID}`);

console.log({ roomID });

document.body.innerHTML = roomID;
