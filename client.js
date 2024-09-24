const net = require("net");
const readline = require("readline/promises");

const PORT = 4020;
const HOST = "127.0.0.1";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const clearLine = (dir) => {
  return new Promise((resolve) => {
    process.stdout.clearLine(dir, () => {
      resolve();
    });
  });
};

const moveCursor = (dx, dy) => {
  return new Promise((resolve) => {
    process.stdout.moveCursor(dx, dy, () => {
      resolve();
    });
  });
};

let id;
let buffer = "";

const socket = net.createConnection({ host: HOST, port: PORT }, async () => {
  console.log("Connected to the server!");
});

socket.on("data", async (data) => {
  buffer += data.toString("utf-8");
  let index;
  while ((index = buffer.indexOf("\n")) !== -1) {
    const dataString = buffer.slice(0, index);
    buffer = buffer.slice(index + 1);
    await processDataString(dataString);
  }
});

socket.on("end", () => {
  console.log("Connection was ended!");
});

async function processDataString(dataString) {
  console.log();
  await moveCursor(0, -1);
  await clearLine(0);

  try {
    const dataObj = JSON.parse(dataString);
    if (dataObj.type === "id") {
      id = dataObj.id;
      console.log(`Your id is ${id}!\n`);
      console.log(
        'Now you are connected to the global chat. If you want to send a direct message, use the command: /dm "User_id" "Message"'
      );
    } else if (dataObj.type === "history") {
      const history = dataObj.history;
      history.forEach((chatMessage) => {
        displayMessage(chatMessage);
      });
    } else {
      displayMessage(dataObj);
    }
  } catch (e) {
    console.error("Error parsing data:", e);
  }

  ask();
}

function displayMessage(chatMessage) {
  const {
    type,
    id: msgId,
    message: msgText,
    timestamp,
    from,
    to,
  } = chatMessage;

  let messageText;
  if (type === "message") {
    messageText = `> User ${msgId}: ${msgText}`;
  } else if (type === "system") {
    messageText = msgText;
  } else if (type === "direct_message") {
    if (to === id) {
      messageText = `*DM* from User ${from}: ${msgText}`;
    } else if (from === id) {
      messageText = `*DM* to User ${to}: ${msgText}`;
    } else {
      return;
    }
  } else {
    return;
  }

  const formattedMessage = formatMessage(messageText, new Date(timestamp));
  console.log(formattedMessage);
}

function formatMessage(message, timestamp) {
  const consoleWidth = process.stdout.columns || 80;
  const timeString = `(${timestamp.toLocaleString()})`;
  const msgLength = message.length + timeString.length;
  if (msgLength >= consoleWidth) {
    return `${message} ${timeString}`;
  } else {
    const padding = consoleWidth - msgLength;
    const padString = " ".repeat(padding);
    return `${message}${padString}${timeString}`;
  }
}

const ask = async () => {
  const message = await rl.question("Enter a message > ");
  await moveCursor(0, -1);
  await clearLine(0);

  if (message.startsWith("/dm ")) {
    const dmRegex = /^\/dm\s+"([^"]+)"\s+"([^"]+)"$/;
    const dmMatch = message.match(dmRegex);

    if (dmMatch) {
      const recipientId = dmMatch[1];
      const dmMessage = dmMatch[2];

      const messageObj = {
        type: "direct_message",
        from: id,
        to: recipientId,
        message: dmMessage,
      };
      socket.write(JSON.stringify(messageObj) + "\n");
    } else {
      console.log(
        'Invalid direct message format. Use: /dm "User_id" "Message"'
      );
    }
  } else {
    const messageObj = { type: "message", id, message };
    socket.write(JSON.stringify(messageObj) + "\n");
  }
};
