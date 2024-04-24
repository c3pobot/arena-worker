'use strict'
const timeTillPayout = require('./timeTillPayout')
module.exports = (offset, type)=>{
  let res = timeTillPayout(offset, type)
  if(res && res.length > 0){
    let poTime = res[0].split(":");
    if(poTime && poTime.length > 0) return +poTime[0]
  }
}
