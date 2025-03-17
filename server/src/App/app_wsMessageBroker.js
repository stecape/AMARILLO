import globalEventEmitter from '../Helpers/globalEventEmitter.js'; // Import globalEventEmitter

export default function app_wsMessageBroker(connection) {
  console.log("ws: ", connection);
  // Listen for dbConnected event
  globalEventEmitter.on('dbConnected', () => {
    connection.emit('dbConnected');
  });

  // Listen for dbDisconnected event
  globalEventEmitter.on('dbDisconnected', () => {
    connection.emit('dbDisconnected');
  });

  // Listen for update event
  globalEventEmitter.on('update', (payload) => {
    connection.emit('update', payload)
  });
}
