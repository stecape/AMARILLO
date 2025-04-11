import globalEventEmitter from '../../Helpers/globalEventEmitter.js';

export default function (app, pool) {

  const DeleteTags = (pool, { deviceIds = [], varIds = [], deviceId = null }) => {
    return new Promise((resolve, reject) => {
      let queryString = `DELETE FROM "Tag" WHERE 1=1`;

      // Aggiungi i filtri per i device e le variabili, se specificati
      if (deviceId) {
        queryString += ` AND device = ${deviceId}`;
      } else if (deviceIds.length > 0) {
        queryString += ` AND device IN (${deviceIds.join(',')})`;
      }
      if (varIds.length > 0) {
        queryString += ` AND var IN (${varIds.join(',')})`;
      }

      console.log("Deleting tags with query: ", queryString);
      pool.query({
        text: queryString,
        rowMode: 'array',
      })
        .then(() => {
          console.log("Tags deleted");
          resolve();
        })
        .catch((error) => {
          console.log("Error during tags deletion", error);
          reject(error);
        });
    });
  };

  const _GenerateTags = (varId, deviceId, name, type, typesList, fieldsList, parent_tag) => {
    // Verifica che fieldsList sia un array
    if (!Array.isArray(fieldsList)) {
      console.error("fieldsList is not an array:", fieldsList);
      return;
    }

    // Itera attraverso i campi e genera le tag
    fieldsList.filter(i => i[3] === type).forEach(f => {
      var tagName = name + '.' + f[1];
      var queryString = `INSERT INTO "Tag" (id, name, device, var, parent_tag, type_field, um, logic_state, comment) VALUES (DEFAULT, '${tagName}', ${deviceId}, ${varId}, ${parent_tag}, ${f[0]}, ${f[4] !== undefined ? f[4] : 'NULL'}, ${f[5] !== undefined ? f[5] : 'NULL'}, ${f[6] !== undefined ? `'${f[6]}'` : 'NULL'}) RETURNING "id"`;
      pool.query({
        text: queryString,
        rowMode: 'array'
      })
      .then(data => {
        var _base_type = typesList.find(i => i[0] === f[2]);
        _base_type = _base_type[2];
        if (!_base_type) {
          _GenerateTags(varId, tagName, f[2], typesList, fieldsList, data.rows[0][0]);
        }
      })
      .catch(error => {
        console.error("Error generating tags:", error);
      });
    });
  };

  const GenerateTags = (pool, { templateId = null, typeId = null, deviceId = null }) => {
    return new Promise((resolve, reject) => {
      let deviceQuery;

      // Determina la query per i device coinvolti
      if (deviceId) {
        deviceQuery = `SELECT id FROM "Device" WHERE id = ${deviceId}`;
      } else if (templateId) {
        deviceQuery = `SELECT DISTINCT "Device".id FROM "Device" WHERE template = ${templateId}`;
      } else if (typeId) {
        deviceQuery = `
          SELECT DISTINCT "Device".id
          FROM "Device"
          INNER JOIN "Var" ON "Device".template = "Var".template
          WHERE "Var".type IN (
            SELECT DISTINCT "Type".id
            FROM "Type"
            WHERE "Type".id IN (${[...DFS(buildDependencyGraph(fieldsList), typeId)].join(',')})
          )`;
      } else {
        deviceQuery = `SELECT DISTINCT "Device".id FROM "Device"`;
      }

      let deviceIds = [];
      let varsList = [];
      let typesList = [];
      let fieldsList = [];

      pool.query({
        text: deviceQuery,
        rowMode: 'array',
      })
        .then((deviceData) => {
          deviceIds = deviceData.rows.map((row) => row[0]);

          // Recupera tutte le variabili, i tipi e i campi
          const varsQuery = `SELECT id, name, type, template, um, logic_state, comment FROM "Var"`;
          const typesQuery = `SELECT * FROM "Type"`;
          const fieldsQuery = `SELECT * FROM "Field"`;

          return Promise.all([
            pool.query({ text: varsQuery, rowMode: 'array' }),
            pool.query({ text: typesQuery, rowMode: 'array' }),
            pool.query({ text: fieldsQuery, rowMode: 'array' }),
          ]);
        })
        .then(([varsData, typesData, fieldsData]) => {
          varsList = varsData.rows;
          typesList = typesData.rows;
          fieldsList = fieldsData.rows;

          // Se è specificato un typeId, calcola tutte le dipendenze del tipo
          let dependentTypeIds = new Set();
          if (typeId) {
            const graph = buildDependencyGraph(fieldsList);
            dependentTypeIds = DFS(graph, typeId);
          }

          // Filtra le variabili in base al template o alle dipendenze del tipo
          const filteredVars = varsList.filter((v) => {
            if (templateId) return v[3] === templateId; // Filtra per template
            if (typeId) return dependentTypeIds.has(v[2]); // Filtra per dipendenze del tipo
            return true; // Nessun filtro
          });

          const varIds = filteredVars.map((v) => v[0]);

          // Elimina le tag coinvolte
          return DeleteTags(pool, { deviceIds, varIds, deviceId }).then(() => ({
            deviceIds,
            filteredVars,
          }));
        })
        .then(({ deviceIds, filteredVars }) => {
          // Rigenera le tag per i device e le variabili filtrate
          const promises = deviceIds.map((currentDeviceId) => {
            return filteredVars.map((v) => {
              const varId = v[0];
              const varName = v[1];
              const varType = v[2];
              const varUm = v[4];
              const varLogicState = v[5];
              const varComment = v[6];

              // Inserisce la prima tag associata alla variabile
              const insertQuery = `INSERT INTO "Tag" (id, name, device, var, parent_tag, type_field, um, logic_state, comment) VALUES (DEFAULT, '${varName}', ${currentDeviceId}, ${varId}, NULL, NULL, ${varUm !== undefined ? varUm : 'NULL'}, ${varLogicState !== undefined ? varLogicState : 'NULL'}, ${varComment !== undefined ? `'${varComment}'` : 'NULL'}) RETURNING "id"`;
              return pool.query({
                text: insertQuery,
                rowMode: 'array',
              })
                .then((insertData) => {
                  const parentTagId = insertData.rows[0][0];
                  const _base_type = typesList.find((i) => i[0] === varType)?.[2];

                  // Se non è un tipo base, genera le sottotag
                  if (!_base_type) {
                    _GenerateTags(varId, currentDeviceId, varName, varType, typesList, fieldsList, parentTagId);
                  }
                });
            });
          });

          return Promise.all(promises.flat());
        })
        .then(() => resolve())
        .catch((error) => reject(error));
    });
  };

  // Funzione per costruire il grafo delle dipendenze
  const buildDependencyGraph = (fieldsList) => {
    const graph = {};
    fieldsList.forEach((field) => {
      const type = field[2];
      const parentType = field[3];
      if (!graph[parentType]) graph[parentType] = [];
      graph[parentType].push(type);
    });
    return graph;
  };

  // Algoritmo DFS per calcolare tutte le dipendenze di un tipo
  const DFS = (graph, typeId, visited = new Set()) => {
    if (visited.has(typeId)) return visited;
    visited.add(typeId);
    (graph[typeId] || []).forEach((childType) => DFS(graph, childType, visited));
    return visited;
  };

  /*
  Delete tags
  Type:   POST
  Route:  '/api/deleteTags'
  Body:   { id: 126 }
  Query:  DELETE FROM "Tags" WHERE "type" = 126
  Event:  {
            operation: 'DELETE',
            table: 'Var',
            data: { id: 126, type: 1, name: 'Temperature 4' }
          }
  Res:    200
  Err:    400
  */
  app.post('/api/deleteTags', (req, res) => {
    const { deviceIds = [], varIds = [], deviceId = null } = req.body;
    DeleteTags(pool, { deviceIds, varIds, deviceId })
      .then(data => res.json({ result: data, message: "Query executed, tags deleted" }))
      .catch(error => res.status(400).json({ code: error.code, detail: error.detail, message: error.detail }));
  });

  /*
  Refresh tags
  Type:   POST
  Route:  '/api/refreshTags'
  Body:   { id: 126 }
  Query:  DELETE FROM "Var" WHERE "id" = 126
  Event:  {
            operation: 'DELETE',
            table: 'Var',
            data: { id: 126, type: 1, name: 'Temperature 4' }
          }
  Res:    200
  Err:    400
  */
  app.post('/api/refreshTags', (req, res) => {
    const { templateId = null, typeId = null, deviceId = null } = req.body;

    GenerateTags(pool, { templateId, typeId, deviceId })
      .then(() => {
        res.json({ message: "Tags refreshed successfully" });
      })
      .catch((error) => {
        console.error(error);
        if (!res.headersSent) {
          res.status(400).json({ code: error.code, detail: error.detail, message: error.message });
        }
      });
  });

  globalEventEmitter.on('refreshTags', (data) => {
    GenerateTags(pool, data)
      .then(() => {
        console.log("Tags refreshed successfully via event");
      })
      .catch((error) => {
        console.error("Error refreshing tags via event:", error);
      });
  });
}