const res = require('express/lib/response')
const { default: mongoose, model } = require('mongoose');
const ciuu = require('../models/ciuu')

const postItem = async (req, res) => {
  const { body } = req
  console.log(body)
  const data = await ciuu.create(body)
  return res.status(200).send({
    status: "success",
    data
  })

};


const getItems = async (req, res) => {
  const data = await ciuu.find({})
  return res.status(200).send({
    status: "success",
    ciuu: data
  })

};

module.exports = { getItems, postItem }