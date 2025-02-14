'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const arrayToObject = require('./arrayToObject')

const { dataList } = require('./dataList')
let notify
const updateUnitsList = async()=>{
  let units = (await mongo.find('autoComplete', {_id: 'unit'}, {data: {value: 0}}))[0]
  if(!units?.data || units?.data?.length == 0) return
  let tempUnits = arrayToObject(units.data, 'baseId')
  if(Object.values(tempUnits)?.length > 0){
    dataList.unitList = tempUnits
    return true
  }
}
const update = async( data )=>{
  try{
    let status = mongo.status()
    if(status) status = await updateUnitsList()
    if(status){
      let msg = 'dataList updated'
      if(data?.gameVersion) msg += ` to version ${data?.gameVersion}...`
      log.info(msg)
      return true
    }
  }catch(e){
    log.error(e)
  }
}
const start = async()=>{
  try{
    let status = mongo.status()
    if(status) status = await update()
    if(status) return
    setTimeout(start, 5000)
  }catch(e){
    log.error(e)
    setTimeout(start, 5000)
  }
}
start()
module.exports = update
