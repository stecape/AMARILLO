import globalEventEmitter from '../../Helpers/globalEventEmitter.js';

export default function (app, pool) {



  /**
   * Aggiungi un dispositivo
   * @route POST /api/addDevice
   * @param {Object} req - La richiesta HTTP.
   * @param {Object} req.body - Il corpo della richiesta.
   * @param {string} req.body.name - Il nome del dispositivo da aggiungere.
   * @param {Object} res - La risposta HTTP.
   * @returns {Object} - L'ID del dispositivo aggiunto e un messaggio di conferma.
   */

  /**
   * Modifica un dispositivo
   * @route POST /api/modifyDevice
   * @param {Object} req - La richiesta HTTP.
   * @param {Object} req.body - Il corpo della richiesta.
   * @param {number} req.body.id - L'ID del dispositivo da modificare.
   * @param {string} req.body.name - Il nuovo nome del dispositivo.
   * @param {Object} res - La risposta HTTP.
   * @returns {Object} - Un messaggio di conferma.
   */

  /**
   * Ottieni tutti i dispositivi
   * @route GET /api/getDevices
   * @param {Object} req - La richiesta HTTP.
   * @param {Object} res - La risposta HTTP.
   * @returns {Object} - Un array di dispositivi e un messaggio di conferma.
   */

  // Aggiungi un dispositivo
  app.post('/api/addDevice', (req, res) => {
    const queryString = `INSERT INTO "Device" (id, name, template, status) VALUES (DEFAULT, '${req.body.name}', '${req.body.template}', 0) RETURNING id`;
    pool.query({
      text: queryString,
      rowMode: 'array'
    })
    .then(data => {
      globalEventEmitter.emit('deviceAdded')
      res.json({ result: data.rows[0], message: "Device inserted" })
    })
    .catch(error => res.status(400).json({ code: error.code, detail: error.detail, message: error.detail }));
  });

  // Modifica un dispositivo
  app.post('/api/modifyDevice', (req, res) => {
    const queryString = `UPDATE "Device" SET name = '${req.body.name}' WHERE id = ${req.body.id}`;
    pool.query({
      text: queryString,
      rowMode: 'array'
    })
    .then(data => {
      globalEventEmitter.emit('deviceUpdated')
      res.json({ result: data.rows[0], message: "Device updated" })
    })
    .catch(error => res.status(400).json({ code: error.code, detail: error.detail, message: error.detail }));
  });

  // Ottieni tutti i dispositivi
  app.get('/api/getDevices', (req, res) => {
    const queryString = `SELECT * FROM "Device"`;
    pool.query({
      text: queryString,
      rowMode: 'array'
    })
    .then(data => { res.json({ result: data.rows, message: "Devices retrieved" }) })
    .catch(error => res.status(400).json({ code: error.code, detail: error.detail, message: error.detail }));
  });
  
  // Elimina un dispositivo
  app.post('/api/removeDevice', (req, res) => {
    var queryString=`DELETE FROM "Device" WHERE id = ${req.body.id};`
    pool.query({
      text: queryString,
      rowMode: 'array'
    })
    .then(data => {
      globalEventEmitter.emit('deviceDeleted')
      res.json({ result: data.rows[0], message: "Device deleted" })
    })
    .catch(error => res.status(400).json({code: error.code, detail: error.detail, message: error.detail}))
  })



}