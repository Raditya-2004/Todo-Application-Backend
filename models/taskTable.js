export default function taskTable(sequelize, DataTypes) {
  return sequelize.define("Task", {
    task: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });
}
