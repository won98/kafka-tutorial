const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const { chatting, sequelize } = require("./models");
const { Kafka } = require("kafkajs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("연결됨");
  })
  .catch((err) => {
    console.log(err);
  });

const kafka = new Kafka({
  clientId: "kafka-client",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "test-consumer" });

const initKafka = async () => {
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({ topic: "message", fromBeginning: true });
};

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.get("/test", async (req, res) => {
  try {
    const { idx } = req.body;
    const rows = await chatting.findOne({ idx: idx });
    if (rows) return res.status(200).json({ result: rows });
  } catch (err) {
    console.log(err);
  }
});
io.on("connection", (socket) => {
  console.log("connect");
  socket.on("disconnect", () => {
    console.log("disconnect");
  });
});
// io.on("connection", (socket) => {
//   socket.on("chat message", (msg) => {
//     console.log("message: " + msg);
//   });
// });
io.emit("some event", {
  someProperty: "some value",
  otherProperty: "other value",
}); // This will emit the event to all connected sockets
// io.on("connection", (socket) => {
//   socket.broadcast.emit("hi");
// });
// io.on("connection", (socket) => {
//   socket.on("chat message", (msg) => {
//     io.emit("chat message", msg);
//   });
// });
io.on("connection", (socket) => {
  socket.on("chat message", async (message) => {
    try {
      let kafkasend = await producer.send({
        topic: "topic",
        messages: [{ value: message.toString() }],
      });
      console.log(kafkasend);
      io.emit("chat message", message);
      console.log(message);
      // const rows = await chatting.create({
      //   message: message,
      // });
      //console.log(msg);
      // const send = await producer.sendBatch({
      //   topic: "topic",
      //   message: {
      //     key: "key",
      //     value: kafkamsg,
      //   },
      // });
      // let kafkasend = JSON.stringify(message);
      // kafkasend = [message];
      // console.log(kafkasend);
      // let sendmsg = {
      //   topic: "topic",
      //   message: kafkasend,
      // };
      // console.log(sendmsg);
      // for (let i = 0; i < kafkasend.length; i++) {
      //   let element = [kafkasend[i]];
      //   if (i == 4) {
      //     // const rows = await chatting.create({
      //     //   message: kafkasend,
      //     // });
      //     console.log("element: " + element);
      //     //console.log(rows);
      //   } else {
      //     console.log("err");
      //   }
      // }

      // for (let i = 0; i < sendmsg.length; i++) {
      //   producer.sendBatch([sendmsg[i]], async (err, data) => {
      //     if ((sendmsg[i] = 5)) {
      //       chatting.create({
      //         message: message,
      //       });
      //       //console.log(rows);
      //     } else {
      //       console.log(err);
      //     }
      //   });
      //   //console.log(rows);
      // }
    } catch (err) {
      console.log(err);
    }
  });
});

initKafka();

server.listen(3003, () => {
  console.log("listening on :3003");
});
