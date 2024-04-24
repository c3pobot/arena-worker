'use strict'
const log = require('logger')
const rabbitmq = require('./rabbitmq')
const cmdProcessor = require('./cmdProcessor')
let queName = process.env.WORKER_QUE_PREFIX || 'worker', consumer, producer, producerReady
queName += '.arena'
const POD_NAME = process.env.POD_NAME || 'po-worker'
const clearQue = async()=>{
  return await rabbitmq.queueDelete({ queue: queName })
}
module.exports.startConsumer = async()=>{
  if(consumer) await consumer.close()
  consumer = rabbitmq.createConsumer({ concurrency: 1, qos: { prefetchCount: 1 }, queue: queName, queueOptions: { durable: true, arguments: { 'x-queue-type': 'quorum' } } }, cmdProcessor)
  consumer.on('error', (err)=>{
    if(err?.code){
      log.error(err.code)
      log.error(err.message)
      return
    }
    log.error(err)
  })
  log.info(`rabbitmq consumer started on ${POD_NAME}`)
  return true
}
module.exports.startProducer = async()=>{
  let status await clearQue()
  log.info(status)
  producer = rabbitmq.createPublisher({ confirm: true, queues: [{ queue: queName, durable: true, arguments: {'x-queue-type': 'quorum'} }]})
  log.info(`rabbitmq producer started on ${POD_NAME}`)
  producerReady = true
  return true
}
module.exports.send = async(payload = {})=>{
  if(!producerReady) return
  await producer.send({ routingKey: queName }, payload })
  return true
}
