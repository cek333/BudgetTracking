const { DataTypes } = require('sequelize');

module.exports = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: false
  },
  note: {
    type: DataTypes.TEXT,
    defaultValue: 'n/a',
    allowNull: false
  }
};
