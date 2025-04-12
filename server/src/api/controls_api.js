/*

GetAllControls returns the following object.
The scope is to group all the necessary information to describe a control for a specific Variable or SubVariable in the HMI.
The numeric values are the ids of the corresponding entities in the database.
The object is structured as follows:

{
    "Pot": {
        "Temperature.Set": {
            "id": 14,
            "name": "Temperature.Set",
            "um": null,
            "logic_state": null,
            "comment": "",
            "fields": {
                "InputValue": 15,
                "Value": 17
            }
        },
        "BatteryLevel.Act": {
            "id": 2,
            "name": "BatteryLevel.Act",
            "um": null,
            "logic_state": null,
            "comment": "",
            "fields": {
                "Value": 3
            }
        },
        "BatteryLevel.Limit": {
            "id": 4,
            "name": "BatteryLevel.Limit",
            "um": null,
            "logic_state": null,
            "comment": "",
            "fields": {
                "Max": 6,
                "Min": 5
            }
        },
        "Temperature.Limit": {
            "id": 16,
            "name": "Temperature.Limit",
            "um": null,
            "logic_state": null,
            "comment": "",
            "fields": {
                "Min": 18,
                "Max": 19
            }
        },
        "BatteryLevel": {
            "id": 1,
            "name": "BatteryLevel",
            "um": 5,
            "logic_state": null,
            "comment": "",
            "fields": {
                "Act": 2,
                "Limit": 4
            }
        },
        "Light": {
            "id": 10,
            "name": "Light",
            "um": null,
            "logic_state": 1,
            "comment": "",
            "fields": {
                "Command": 11,
                "Status": 12
            }
        },
        "Temperature": {
            "id": 13,
            "name": "Temperature",
            "um": 2,
            "logic_state": null,
            "comment": "",
            "fields": {
                "Set": 14,
                "Limit": 16
            }
        }
    },
    "Toast": {
        "Test.Set": {
            "id": 21,
            "name": "Test.Set",
            "um": null,
            "logic_state": null,
            "comment": "",
            "fields": {
                "InputValue": 22,
                "Value": 24
            }
        },
        "Test.Limit": {
            "id": 23,
            "name": "Test.Limit",
            "um": null,
            "logic_state": null,
            "comment": "",
            "fields": {
                "Min": 25,
                "Max": 26
            }
        },
        "Test": {
            "id": 20,
            "name": "Test",
            "um": 1,
            "logic_state": null,
            "comment": "",
            "fields": {
                "Set": 21,
                "Limit": 23
            }
        }
    }
}
*/


import globalEventEmitter from '../Helpers/globalEventEmitter.js';

export default function (app, pool) {

  app.post('/api/getAllControls', async (req, res) => {
    try {
      // Recupera tutti i device e i loro template
      const deviceQuery = `SELECT id, name, template FROM "Device"`;
      const deviceResult = await pool.query({
        text: deviceQuery,
        rowMode: 'array',
      });
      const devices = deviceResult.rows;

      // Recupera tutte le variabili, i campi e le tag
      const varsQuery = `SELECT * FROM "Var"`;
      const fieldsQuery = `SELECT * FROM "Field"`;
      const tagsQuery = `SELECT * FROM "Tag"`;

      const [varsResult, fieldsResult, tagsResult] = await Promise.all([
        pool.query({ text: varsQuery, rowMode: 'array' }),
        pool.query({ text: fieldsQuery, rowMode: 'array' }),
        pool.query({ text: tagsQuery, rowMode: 'array' }),
      ]);

      const vars = varsResult.rows;
      const fields = fieldsResult.rows;
      const tags = tagsResult.rows;

      const result = {};

      // Costruisci la struttura dei controlli per ogni device
      devices.forEach((device) => {
        const [deviceId, deviceName, templateId] = device;

        // Filtra le variabili associate al template del device
        const templateVars = vars.filter((v) => v[3] === templateId);

        // Costruisci i controlli per ogni variabile
        const deviceControls = templateVars.reduce((controls, variable) => {
          const [varId, varName] = variable;

          // Filtra le tag associate alla variabile
          const varTags = tags.filter((tag) => tag[3] === varId);

          // Costruisci i controlli per ogni tag
          varTags.forEach((tag) => {
            const control = {
              device: deviceId,
              id: tag[0],
              name: tag[1],
              um: tag[6],
              logic_state: tag[7],
              comment: tag[8],
              fields: tags
                .filter((t) => t[4] == tag[0])
                .reduce((acc, _t) => {
                  const field = fields.find((f) => f[0] == _t[5]);
                  if (field) {
                    acc[field[1]] = _t[0];
                  }
                  return acc;
                }, {}),
            };

            controls[control.name] = control;
          });

          return controls;
        }, {});

        result[deviceName] = deviceControls;
      });

      globalEventEmitter.emit('gotAllControls');
      res.json({ result, message: 'Just got all controls' });
    } catch (error) {
      res.status(400).json({ code: error.code, detail: error.detail, message: error.detail });
    }
  });

}