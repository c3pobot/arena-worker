'use strict'
module.exports = (obj = {})=>{
  let type = 'Squad'
  if(obj.type == 'ship') type = 'Fleet';
  return type
}
