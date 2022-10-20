module.exports = (sequelize, DataTypes) => {
  const Chatting = sequelize.define(
    "chatting",
    {
      idx: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      value: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
      comment: "채팅내역 테이블",
    }
  );
  return Chatting;
};
