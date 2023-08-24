const log = require('logger')
const mongo = require('mongoclient')
const arrayToObject = require('./arrayToObject')
let configMaps = { unitList: {} }, mongoReady
const syncConfigMap = async()=>{
  try{

    let units = (await mongo.find('autoComplete', {_id: 'unit'}, {data: {value: 0}}))[0]
    if(units?.data?.length > 0){
      let tempUnits = arrayToObject(units.data, 'baseId')
      if(Object.values(tempUnits)?.length > 0){
        //console.log('Updated unitList')
        configMaps.unitList = tempUnits
      }
    }
    setTimeout(syncConfigMap, 3600000)
  }catch(e){
    log.error(e)
    setTimeout(syncConfigMap, 5000)
  }
}
const Start = ()=>{
  let status = mongo.status()
  if(status){
    syncConfigMap()
    return
  }
  setTimeout(Start, 5000)
}
Start()
module.exports = {
  configMaps
}
