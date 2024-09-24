
# Chat Application in Node.js

This is a simple real-time chat application built with Node.js using TCP sockets. It allows multiple clients to communicate with each other in real-time. The application supports global messages, chat history, timestamps, and direct messages between users.




## Features

- Real-Time Communication: Users can send messages that are instantly broadcasted to all connected clients.
- Chat History: New users receive the full chat history upon connecting to the server.
- Timestamps: Each message is tagged with the date and time it was sent, displayed on the right side of the console.
- Direct Messages: Users can send private messages to specific users using a special command.





## Installation

Install my-project with npm

```bash
    git clone https://github.com/yourusername/node-realtime-chat-app.git
    cd node-realtime-chat-app
    npm install
```
    

### Running the Application

Open a terminal and navigate to the application directory.

Then run the server using:

```bash
node server.js
```
You should see a message like this:

```csharp
Opened server on { address and port }
```

In a new terminal (open a new terminal for each client), Run the client:

```bash
node client.js
```

You should see messages similar to:

```vbnet
Connected to the server!
Your id is 1! <== your unique id 

Now you are connected to the global chat. If you want to send a direct message, use the command: /dm "User_id" "Message"

Enter a message >
```


## Direct Message

To send a private message to a specific user:

Use the command in the following format:

```bash
/dm "User_id" "Message content"
```
Example:

```bash

/dm "2" "Hello there!"

```
