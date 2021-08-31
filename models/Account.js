module.exports = function (sequelize, DataTypes) {
  const Account = sequelize.define('Account', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  });
  // Add junction table via associations
  Account.associate = function (models) {
    Account.belongsToMany(models.Category, { through: 'AccountCategories' });
  };
  return Account;
};
