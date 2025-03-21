const pathModels = process.env.ENGINE_DB === "nosql" ? "./nosql/" : "./mysql/";
const models = {
  usersModel: require(pathModels + "users"),
  tracksModel: require(pathModels + "tracks"),
  storageModel: require(pathModels + "storage"),
};
module.exports = models;
