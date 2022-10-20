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
    },
  });
};

initKafka();
