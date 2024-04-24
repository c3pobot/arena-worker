'use strict'
const log = require('logger')
const Cmds = require('src/cmds')
module.exports = async(obj = {})=>{
  try{
    if(!obj?.body? || !obj?.body?.name) return
    if(Cmds[obj.body.data.name]) await Cmds[obj.body.name](obj.body)
    return 1
  }catch(e){
    log.error(e)
    return 1
  }
}
