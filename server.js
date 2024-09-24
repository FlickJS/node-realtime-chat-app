const net = require("net");

const PORT = 4020;
const HOST = "127.0.0.1";

const server = net.createServer();

const clients = new Map();
const chatHistory = [];

server.on("connection", (socket) => {
  console.log("A new connection to the server!");

  const clientId = (clients.size + 1).toString();
  const timestamp = new Date();

  const joinMessage = {
    type: "system",
    message: `User ${clientId} joined!`,
    timestamp: timestamp.toISOString(),
  };
  chatHistory.push(joinMessage);

  clients.forEach((client) => {
    client.socket.write(JSON.stringify(joinMessage) + "\n");
  });

  socket.write(JSON.stringify({ type: "id", id: clientId }) + "\n");
  socket.write(
    JSON.stringify({ type: "history", history: chatHistory }) + "\n"
  );

  let buffer = "";

  socket.on("data", (data) => {
    buffer += data.toString("utf-8");
    let index;
    while ((index = buffer.indexOf("\n")) !== -1) {
      const dataString = buffer.slice(0, index);
      buffer = buffer.slice(index + 1);

      try {
        const dataObj = JSON.parse(dataString);

        if (dataObj.type === "message") {
          const id = dataObj.id;
          const message = dataObj.message;
          const timestamp = new Date();

          const chatMessage = {
            type: "message",
            id,
            message,
            timestamp: timestamp.toISOString(),
          };
          chatHistory.push(chatMessage);

          clients.forEach((client) => {
            client.socket.write(JSON.stringify(chatMessage) + "\n");
          });
        } else if (dataObj.type === "direct_message") {
          const fromId = dataObj.from;
          const toId = dataObj.to;
          const message = dataObj.message;
          const timestamp = new Date();

          const dmMessage = {
            type: "direct_message",
            from: fromId,
            to: toId,
            message,
            timestamp: timestamp.toISOString(),
          };

          const recipient = clients.get(toId);
          if (recipient) {
            recipient.socket.write(JSON.stringify(dmMessage) + "\n");
            socket.write(
              JSON.stringify({
                type: "system",
                message: `DM sent to User ${toId}`,
                timestamp: timestamp.toISOString(),
              }) + "\n"
            );
          } else {
            const errorMessage = {
              type: "system",
              message: `User ${toId} not found.`,
              timestamp: timestamp.toISOString(),
            };
            socket.write(JSON.stringify(errorMessage) + "\n");
          }
        }
      } catch (e) {
        console.error("Error parsing data:", e);
      }
    }
  });

  socket.on("end", () => {
    const timestamp = new Date();
    const leaveMessage = {
      type: "system",
      message: `User ${clientId} left!`,
      timestamp: timestamp.toISOString(),
    };
    chatHistory.push(leaveMessage);

    clients.forEach((client) => {
      client.socket.write(JSON.stringify(leaveMessage) + "\n");
    });

    clients.delete(clientId);
  });

  clients.set(clientId, { id: clientId, socket });
});

server.listen(PORT, HOST, () => {
  console.log("Opened server on", server.address());
});
