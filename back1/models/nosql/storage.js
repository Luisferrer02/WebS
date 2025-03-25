//models/nosql/storage.js

const mongoose = require('mongoose');

const StorageSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
    },
    ipfs: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model('storages', StorageSchema);
