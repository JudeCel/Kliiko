'use strict';
module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('Users', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      accountName: {type: Sequelize.STRING, allowNull: false, unique: true},
      promoCode: {type: Sequelize.STRING, allowNull: true},
      resetPasswordToken: {type : Sequelize.STRING, allowNull: true},
      resetPasswordSentAt: {type : Sequelize.DATE, allowNull: true},
      currentSignInIp: {type : Sequelize.STRING, allowNull: true},
      firstName: {type: Sequelize.STRING, allowNull: false},
      lastName: {type: Sequelize.STRING, allowNull: false},
      email: {type: Sequelize.STRING, allowNull: false, unique: true},
      encryptedPassword: { type : Sequelize.STRING, allowNull: false},
      createdAt: {type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW},
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW},
      tipsAndUpdate: {type: Sequelize.ENUM, values: ['off', 'on'], allowNull: false, defaultValue: 'on'},
      },
    {
      charset: 'utf8'
    }
  )
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('Users');
  }
};
