module.exports = function (sequelize, DataTypes) {
  const Category = sequelize.define('Category', {
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
  Category.associate = function (models) {
    Category.belongsToMany(models.Account, { through: 'AccountCategories' });
  };
  return Category;
};
