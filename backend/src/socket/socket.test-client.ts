import { io } from "socket.io-client";

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTg1YjFjMWJmMWRiYTIxYzkxNjE4YmIiLCJlbWFpbCI6ImluZm9AcHJvbXB0dGVjaC5jby5pbiIsImlhdCI6MTc4NzIxMjE5MCwiZXhwIjoxNzg3ODE2OTkwfQ.jeRdKFiBfBd9HaNFSxTWFyEQW03ETTXv9zbAVWmjnMg";

const socket = io(
  "http://localhost:3000",
  {
    auth: {
      token,
    },
  }
);

socket.on("connect", () => {
  console.log(
    "Connected to Socket.IO:",
    socket.id
  );
});

socket.on(
  "new_message",
  (data) => {
    console.log(
      "========== NEW WHATSAPP MESSAGE =========="
    );

    console.log(
      JSON.stringify(
        data,
        null,
        2
      )
    );

    console.log(
      "==========================================="
    );
  }
);

socket.on(
  "connect_error",
  (error) => {
    console.error(
      "Socket connection error:",
      error.message
    );
  }
);

socket.on(
  "disconnect",
  (reason) => {
    console.log(
      "Disconnected from Socket.IO:",
      reason
    );
  }
);