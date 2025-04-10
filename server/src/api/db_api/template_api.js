import globalEventEmitter from '../../Helpers/globalEventEmitter.js';

export default function (app, pool) {

  /**
   * Aggiungi un template
   * @route POST /api/addTemplate
   * @param {Object} req - La richiesta HTTP.
   * @param {Object} req.body - Il corpo della richiesta.
   * @param {string} req.body.name - Il nome del template da aggiungere.
   * @param {Object} res - La risposta HTTP.
   * @returns {Object} - L'ID del template aggiunto e un messaggio di conferma.
   */

  /**
   * Modifica un template
   * @route POST /api/modifyTemplate
   * @param {Object} req - La richiesta HTTP.
   * @param {Object} req.body - Il corpo della richiesta.
   * @param {number} req.body.id - L'ID del template da modificare.
   * @param {string} req.body.name - Il nuovo nome del template.
   * @param {Object} res - La risposta HTTP.
   * @returns {Object} - Un messaggio di conferma.
   */

  /**
   * Ottieni tutti i template
   * @route GET /api/getTemplates
   * @param {Object} req - La richiesta HTTP.
   * @param {Object} res - La risposta HTTP.
   * @returns {Object} - Un array di template e un messaggio di conferma.
   */

  /**
   * Elimina un template
   * @route POST /api/removeTemplate
   * @param {Object} req - La richiesta HTTP.
   * @param {Object} req.body - Il corpo della richiesta.
   * @param {number} req.body.id - L'ID del template da eliminare.
   * @param {Object} res - La risposta HTTP.
   * @returns {Object} - Un messaggio di conferma.
   */

  // Aggiungi un template
  app.post('/api/addTemplate', (req, res) => {
    const queryString = `INSERT INTO "Template" (id, name) VALUES (DEFAULT, '${req.body.name}') RETURNING id`;
    pool.query({
      text: queryString,
      rowMode: 'array'
    })
    .then(data => {
      res.json({ result: data.rows[0], message: "Template inserted" })
    })
    .catch(error => res.status(400).json({ code: error.code, detail: error.detail, message: error.detail }));
  });

  // Modifica un template
  app.post('/api/modifyTemplate', (req, res) => {
    const queryString = `UPDATE "Template" SET name = '${req.body.name}', WHERE id = ${req.body.id}`;
    pool.query({
      text: queryString,
      rowMode: 'array'
    })
    .then(data => {
      res.json({ result: data.rows[0], message: "Template updated" })
    })
    .catch(error => res.status(400).json({ code: error.code, detail: error.detail, message: error.detail }));
  });

  // Ottieni tutti i template
  app.get('/api/getTemplates', (req, res) => {
    const queryString = `SELECT * FROM "Template"`;
    pool.query({
      text: queryString,
      rowMode: 'array'
    })
    .then(data => { res.json({ result: data.rows, message: "Templates retrieved" }) })
    .catch(error => res.status(400).json({ code: error.code, detail: error.detail, message: error.detail }));
  });

  // Elimina un template
  app.post('/api/removeTemplate', (req, res) => {
    const checkDevicesQuery = `SELECT COUNT(*) FROM "Device" WHERE template = ${req.body.id}`;
    pool.query({
      text: checkDevicesQuery,
      rowMode: 'array'
    })
    .then(data => {
      if (parseInt(data.rows[0][0]) > 0) {
        res.status(400).json({ message: "Cannot delete template: it is referenced by one or more devices." });
      } else {
        const deleteTemplateQuery = `DELETE FROM "Template" WHERE id = ${req.body.id}`;
        pool.query({
          text: deleteTemplateQuery,
          rowMode: 'array'
        })
        .then(() => {
          res.json({ message: "Template and associated Vars deleted successfully." });
        })
        .catch(error => res.status(400).json({ code: error.code, detail: error.detail, message: error.detail }));
      }
    })
    .catch(error => res.status(400).json({ code: error.code, detail: error.detail, message: error.detail }));
  });

}