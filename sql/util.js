const _ = require('lodash'),
  csv = require('csvtojson'),
  fs = require('fs'),
  path = require('path'),
  rimraf = require('rimraf')

function isNotANumber(val) { return _.isNaN(_.toNumber(val)) }

const csvCache = {}

async function loadCsv(csvPath) {
  if (csvCache[csvPath]) {
    return csvCache[csvPath]
  }
  const csvjson = await csv().fromFile(csvPath)
  csvCache[csvPath] = csvjson
  return csvjson
}

async function deleteIfExists(filePath) {
  rimraf.sync(filePath)
}

module.exports = {
  isNotANumber,
  loadCsv,
  deleteIfExists
}