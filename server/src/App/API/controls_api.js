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

import globalEventEmitter from '../../Helpers/eventHandler.js';

export default function (app, pool) {

  // Get all controls
  app.post('/api/getAllControls', async (req, res) => {
    try {
      const deviceQuery = `SELECT * FROM "Device"`;
      const deviceResult = await pool.query({
        text: deviceQuery,
        rowMode: 'array'
      });
      const devices = deviceResult.rows;

      const result = {};

      for (const device of devices) {
        const deviceId = device[0];
        const deviceName = device[1];

        const tagQuery = `
          SELECT "Tag".*
          FROM "Tag"
          LEFT JOIN "Field" ON "Tag".type_field = "Field".id
          LEFT JOIN "Type" ON "Field".type = "Type".id
          LEFT JOIN "Var" ON "Tag".var = "Var".id
          WHERE ("Type".base_type = false OR "Tag".type_field IS null)
          AND "Var".device = $1;
        `;
        const tagResult = await pool.query({
          text: tagQuery,
          values: [deviceId],
          rowMode: 'array'
        });
        const tags = tagResult.rows;

        const fieldQuery = `SELECT * FROM "Field"`;
        const fieldResult = await pool.query({
          text: fieldQuery,
          rowMode: 'array'
        });
        const fields = fieldResult.rows;

        const varQuery = `SELECT * FROM "Var"`;
        const varResult = await pool.query({
          text: varQuery,
          rowMode: 'array'
        });
        const vars = varResult.rows;

        const allTagQuery = `SELECT * FROM "Tag"`;
        const allTagResult = await pool.query({
          text: allTagQuery,
          rowMode: 'array'
        });
        const allTags = allTagResult.rows;

        const deviceResult = tags.reduce((list, tag) => {
          const obj = {
            device: deviceId,
            id: tag[0],
            name: tag[1],
            um: tag[5],
            logic_state: tag[6],
            comment: tag[7],
            fields: allTags.filter(t => t[3] == tag[0]).reduce((acc, _t) => {
              const field = fields.find(f => f[0] == _t[4]);
              if (field) {
                acc[field[1]] = _t[0];
              }
              return acc;
            }, {})
          };
          list[obj.name] = obj;
          return list;
        }, {});

        result[deviceName] = deviceResult;
      }

      globalEventEmitter.emit('gotAllControls');
      res.json({ result: result, message: "Just got all controls" });
    } catch (error) {
      res.status(400).json({ code: error.code, detail: error.detail, message: error.detail });
    }
  });
}