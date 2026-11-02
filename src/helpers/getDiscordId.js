'use strict'
const { swgohCache } = require('src/cache')

module.exports = async(obj = {})=>{
  if(obj.dId) return obj.dId
  let dObj
  if(obj.allyCode) dObj = await swgohCache.get('discordId', { 'allyCodes.allyCode': +obj.allyCode })
  if(dObj?._id) return dObj?._id
}
