import globalEventEmitter from '../../Helpers/globalEventEmitter.js';

export default function (app, pool) {

  const getVars = () => {
    return new Promise((resolve, reject) => {
      //Retreiving the typesList
      var queryString = `SELECT id, name, type from "Var"`
      pool.query({
        text: queryString,
        rowMode: 'array'
      })
      .then(data => resolve(data.rows))
      .catch(error => reject(error))    
    })
  }

  const getTypes = () => {
    return new Promise((resolve, reject) => {
      //Retreiving the typesList
      var queryString = `SELECT * from "Type"`
      pool.query({
        text: queryString,
        rowMode: 'array'
      })
      .then(data => resolve(data.rows))
      .catch(error => reject(error))    
    })
  }

  const getFields = () => {
    return new Promise((resolve, reject) => {
      //Retreiving the fieldsList
      pool.query({text: `SELECT * from "Field"`, rowMode: 'array'})
        .then(data => resolve(data.rows))
        .catch(error => reject(error))    
    })
  }

  const deleteTags = () => {
    return new Promise((resolve, reject) => {
      //Retreiving the fieldsList
      var queryString = `TRUNCATE "Tag"`
      console.log("Deleting tags: ", queryString)
      pool.query({
        text: queryString,
        rowMode: 'array'
      })
      .then(() => {
        console.log("Tags deleted")
        resolve()
      })
      .catch(error => {
        console.log("Error during tags deletion", error)
        reject(error)
      })    
    })
  }



  
  /*
  0: real
  1: bool
  2: _Set
  3: _Act
  4: _Limit
  5: Set
  6: Act
  7: SetAct

  Creo una Var "Power" di tipo SetAct:
  Power: {
    Set: {
      InputValue: 0.0,
      Value: 0.0
    },
    Act: {
      Value: 0.0
    },
    Limit: {
      Min: 0.0,
      Max: 0.0
    },
  }

  devo generare tutte le tag che la compongono:
  (PK) = Var (FK) + TypeField (FK)      Name                    Var (FK)          Parent Tag (IFK)   TypeField (FK)  Value
                                        Power                   Power(id)         NULL               7               NULL
                                        Power.Set               Power(id)         10                 2               NULL
                                        Power.Act               Power(id)         10                 3               NULL
                                        Power.Limit             Power(id)         10                 4               NULL
                                        Power.Set.InputValue    Power(id)         11                 8               0
                                        Power.Set.Value         Power(id)         11                 9               0
                                        Power.Act.Value         Power(id)         12                 6               0
                                        Power.Limit.Min         Power(id)         13                 5               0
                                        Power.Limit.Max         Power(id)         13                 8               0

  For each t in Types
    Select_One parent_type from Fields where type == t
  */


  const _GenerateTags = (varId, deviceId, name, type, typesList, fieldsList, parent_tag) => {
    //Iterate through the types tree until it reaches the leaves, generating the tags
    fieldsList.filter(i => i[3] === type).forEach(f => {
      var tagName = name+'.'+f[1]
      var queryString=`INSERT INTO "Tag" (id, name, device, var, parent_tag, type_field, um, logic_state, comment) VALUES (DEFAULT, '${tagName}', ${deviceId}, ${varId}, ${parent_tag}, ${f[0]}, ${f[4] !== undefined ? f[4] : 'NULL'}, ${f[5] !== undefined ? f[5] : 'NULL'}, ${f[6] !== undefined ? `'${f[6]}'` : 'NULL'}) RETURNING "id"`
      pool.query({
        text: queryString,
        rowMode: 'array'
      })
      .then(data => {
        var _base_type = typesList.find(i => i[0] === f[2])
        _base_type = _base_type[2]
        if (!_base_type){
          _GenerateTags(varId, tagName, f[2], typesList, fieldsList, data.rows[0][0])
        }
      })
      return
    })
  }

  const GenerateTags = (varId, deviceId, varName, varType, typesList, fieldsList, um, logic_state, comment) => {
    return new Promise((resolve, reject) => {
      // Delete old tags
      var queryString = `DELETE FROM "Tag" WHERE var = ${varId}`;
      pool.query({
        text: queryString,
        rowMode: 'array',
      })
        .then(() => {
          // Inserting the first Tag corresponding to the var
          queryString = `INSERT INTO "Tag" (id, name, device, var, parent_tag, type_field, um, logic_state, comment) VALUES (DEFAULT, '${varName}', ${deviceId}, ${varId}, NULL, NULL, ${um !== undefined ? um : 'NULL'}, ${logic_state !== undefined ? logic_state : 'NULL'}, ${comment !== undefined ? `'${comment}'` : 'NULL'}) RETURNING "id"`;
          return pool.query({
            text: queryString,
            rowMode: 'array',
          });
        })
        .then(data => {
          var _base_type = typesList.find(i => i[0] === varType);
          _base_type = _base_type[2];
          // If it is not a base type, generate all the sub-tags iterating all the items
          if (!_base_type) {
            _GenerateTags(varId, deviceId, varName, varType, typesList, fieldsList, data.rows[0][0]);
          }
        })
        .then(() => resolve())
        .catch(error => reject(error));
    });
  }





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
    //Delete old tags
    deleteTags()
    .then(data => res.json({result: data, message: "Query executed, old tags cleaned"}))
    .catch(error => res.status(400).json({code: error.code, detail: error.detail, message: error.detail}))
  })


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
    var varId, varName, varType, varsList, typesList, fieldsList, varUm, varLogicState;
    deleteTags()
      .then(() => {
        return getVars();
      })
      .then((data) => {
        varsList = data;
        return getTypes();
      })
      .then((data) => {
        typesList = data;
        return getFields();
      })
      .then((data) => {
        fieldsList = data;
        const promises = varsList.map((v) => {
          varId = v[0];
          varName = v[1];
          varType = v[2];
          varUm = v[3];
          varLogicState = v[4];
          return GenerateTags(varId, varName, varType, typesList, fieldsList, varUm, varLogicState);
        });
        return Promise.all(promises);
      })
      .then((response) => {
        res.json({ result: response, message: "Tags refreshed" });
      })
      .catch((error) => {
        console.error(error);
        if (!res.headersSent) {
          res.status(400).json({ code: error.code, detail: error.detail, message: error.message });
        }
      });
  });
}