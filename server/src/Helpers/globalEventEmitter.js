import EventEmitter from 'events'
class _Emitter extends EventEmitter {}
const globalEventEmitter = new _Emitter()
export default globalEventEmitter