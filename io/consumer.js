const { Kafka } = require("kafkajs");
const { chatting, sequelize } = require("./models");

const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "test-group" });
//console.log(consumer);

const initKafka = async () => {
  console.log("start subscribe");
  await consumer.connect();
  await consumer.subscribe({ topic: "topic", fromBeginning: true });
  let arr = [];
  await consumer.run({
    eachMessage: async ({ topic, partition, message, req, res }) => {
      let msg = message;
      const push = arr.push(msg);
      console.log(push);
      console.log(arr);
      if (arr.length == 5) {
        // let save = arr.forEach((value) => {
        //   console.log(value.tostring());
        // });

        // console.log(save);
        // console.log(save);
        const rows = await chatting
          .bulkCreate(arr, { hooks: true })
          .catch((err) => {
            console.log(err);
          });
        arr.splice(0);
        console.log(rows);
        return;
      }
      console.log({
        value: message.value.toString(),
      });
      //}

      // let array = Array.push(message.value.toString);
      // console.log(array);
      // if ((Array.length = 5)) {
      //   const rows = await chatting.create({
      //     message: message,
      //   });
      //   console.log(rows);
      // }
      // for (let i = 0; i < message.value.length; i++) {
      //   // const element = message.value[i];
      //   if (message.value[i] == 5) {
      //     const rows = await chatting.create({
      //       message: message,
      //     });
      //     console.log(rows);
      //   }
      // }
    },
  });
};

initKafka();
// const rows = await chatting.create({
//   message: message.value,
// });
// console.log(rows);
// console.log({
//   value: message.value,
// });
// console.log(message);
