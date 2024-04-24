'use strict'
const mongo = require('mongoclient')
module.exports = async(obj = {})=>{
  if(obj.dId) return obj.dId
  let dObj
  if(obj.allyCode) dObj = (await mongo.find('discordId', {'allyCodes.allyCode': +obj.allyCode}))[0]
  if(dObj?._id) return dObj?._id
}
