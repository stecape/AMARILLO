import React, { useState, useEffect, useContext, createContext, useMemo } from 'react'
import { useAddMessage } from "@react-md/alert"
import { SocketContext } from './socket'
import axios from 'axios'

export const ctxData = createContext()

export const CtxProvider = ({ children }) => {

  const addMessage = useAddMessage()
  const socket = useContext(SocketContext)
  const [types, setTypes] = useState([])
  const [fields, setFields] = useState([])
  const [ums, setUms] = useState([])
  const [logicStates, setLogicStates] = useState([])
  const [vars, setVars] = useState([])
  const [tags, setTags] = useState([])
  const [backendStatus, setBackendStatus] = useState({backendConnected: false, dbConnected: false, mqttConnected: false})
  const [init, setInit] = useState(false)
  const [devices, setDevices] = useState([]);
  const [controls, setControls] = useState([]); //array di oggetti. Ogni oggetto conterrà le tagId appartenenti ad un certo data type
  useEffect(() => {

    const retrieveData = async () => {
      if (socket.connected) {
        try {
          console.log("trying to retrieve data")
          const requests = [
            axios.post('http://localhost:3001/api/getAll', { table: "Type", fields: ["name", "id", "base_type", "locked"] }),
            axios.post('http://localhost:3001/api/getAll', { table: "Field", fields: ['id', 'name', 'type', 'parent_type', 'um', 'logic_state', 'comment'] }),
            axios.post('http://localhost:3001/api/getAll', { table: "um", fields: ['id', 'name', 'metric', 'imperial', 'gain', '"offset"'] }),
            axios.post('http://localhost:3001/api/getAll', { table: "LogicState", fields: ['id', 'name', 'value'] }),
            axios.post('http://localhost:3001/api/getAll', { table: "Var", fields: ['id', 'device', 'name', 'type', 'um', 'logic_state', 'comment'] }),
            axios.post('http://localhost:3001/api/getAll', { table: "Tag", fields: ['id', 'name', 'var', 'parent_tag', 'type_field', 'um', 'logic_state', 'comment', 'value'] }),
            axios.post('http://localhost:3001/api/getAll', { table: "Device", fields: ['id', 'name', 'status'] }),
            axios.post('http://localhost:3001/api/getAllControls'),
            axios.post('http://localhost:3001/api/getBackendStatus')
          ];
      
          const responses = await Promise.all(requests);
      
          setTypes(responses[0].data.result.map((val) => ({ name: val[0], id: val[1], base_type: val[2], locked: val[3] })));
          addMessage({ children: responses[0].data.message });
      
          setFields(responses[1].data.result.map((val) => ({ id: val[0], name: val[1], type: val[2], parent_type: val[3], um: val[4], logic_state: val[5], comment: val[6] })));
          addMessage({ children: responses[1].data.message });
      
          setUms(responses[2].data.result.map((val) => ({ id: val[0], name: val[1], metric: val[2], imperial: val[3], gain: val[4], offset: val[5] })));
          addMessage({ children: responses[2].data.message });
      
          setLogicStates(responses[3].data.result.map((val) => ({ id: val[0], name: val[1], value: val[2] })));
          addMessage({ children: responses[3].data.message });
      
          setVars(responses[4].data.result.map((val) => ({ id: val[0], device: val[1], name: val[2], type: val[3], um: val[4], logic_state: val[5], comment: val[6] })));
          addMessage({ children: responses[4].data.message });
      
          setTags(responses[5].data.result.map((val) => ({ id: val[0], name: val[1], var: val[2], parent_tag: val[3], type_field: val[4], um: val[5], logic_state: val[6], comment: val[7], value: val[8] })));
          addMessage({ children: responses[5].data.message });
      
          setDevices(responses[6].data.result.map((val) => ({ id: val[0], name: val[1], status: val[2] })));
          addMessage({ children: responses[6].data.message });
      
          setControls(responses[7].data.result);
          addMessage({ children: responses[7].data.message });
      
          setBackendStatus(prevStatus => ({ ...prevStatus, dbConnected: responses[8].data.result.dbConnected, mqttConnected: responses[8].data.result.mqttConnected }));
          addMessage({ children: responses[8].data.message });

          setInit(true);
      
        } catch (error) {
          console.log("error while retrieving data: ", error);
          setInit(false);
        }
      } else {
        console.log("socket not connected")
        setInit(false);
      }
    
    };

    const on_connect = () => {
      console.log("socket connected")
      setBackendStatus(prevStatus => ({ ...prevStatus, backendConnected: socket.connected }))
      retrieveData()
    }

    const on_error = (...args) => {
      console.log("socket error:", args[0])
      setBackendStatus(prevStatus => ({ ...prevStatus, backendConnected: false }))
    }

    const on_connect_error = (...args) => {
      console.log("socket connect error:", args[0])
      setBackendStatus(prevStatus => ({ ...prevStatus, backendConnected: false }))
    }

    const on_update = async (...args) => {
      const value = args[0]

      

      switch(value.table){
        //Type
        case "Type":
          switch(value.operation){
            case 'INSERT':
              setTypes(prevTypes => [...prevTypes, value.data])
              break

            case 'DELETE':
              setTypes(prevTypes => [...prevTypes.filter(i => i.id !== value.data.id)])
              break

            case 'TRUNCATE':
              setTypes(prevTypes => [...[]])
              break

            case 'UPDATE':
              setTypes(prevTypes => [...prevTypes.map(i => { return i.id === value.data.id ? value.data : i })])
              break
            
            default:
              break
          }
          break

        //Field
        case "Field":
          switch(value.operation){
            case 'INSERT':
              setFields(prevFields => [...prevFields, value.data])
              break

            case 'DELETE':
              setFields(prevFields => [...prevFields.filter(i => i.id !== value.data.id)])
              break

            case 'TRUNCATE':
              setFields(prevFields => [...[]])
              break

            case 'UPDATE':
              setFields(prevFields => [...prevFields.map(i => { return i.id === value.data.id ? value.data : i })])
              break
            
            default:
              break
          }
          break

        //um
        case "um":
          switch(value.operation){
            case 'INSERT':
              setUms(prevUms => [...prevUms, value.data])
              break

            case 'DELETE':
              setUms(prevUms => [...prevUms.filter(i => i.id !== value.data.id)])
              break

            case 'TRUNCATE':
              setUms(prevUms => [...[]])
              break

            case 'UPDATE':
              setUms(prevUms => [...prevUms.map(i => { return i.id === value.data.id ? value.data : i })])
              break

            default:
              break
          }
          break

        //LogicState
        case "LogicState":
          switch(value.operation){
            case 'INSERT':
              setLogicStates(prevLogicStates => [...prevLogicStates, value.data])
              break
              
            case 'DELETE':
              setLogicStates(prevLogicStates => [...prevLogicStates.filter(i => i.id !== value.data.id)])
              break
              
            case 'TRUNCATE':
              setLogicStates(prevLogicStates => [...[]])
              break

            case 'UPDATE':
              setLogicStates(prevLogicStates => [...prevLogicStates.map(i => { return i.id === value.data.id ? value.data : i })])
              break

            default:
              break
          }
          break

        //Vars
        case "Var":
          switch(value.operation){
            case 'INSERT':
              setVars(prevVars => [...prevVars, value.data])
              break

            case 'DELETE':
              setVars(prevVars => [...prevVars.filter(i => i.id !== value.data.id)])
              break
        
            case 'TRUNCATE':
              setVars(prevVars => [...[]])
              break
              
            case 'UPDATE':
              setVars(prevVars => [...prevVars.map(i => { return i.id === value.data.id ? value.data : i })])
              break

            default:
              break
          }
          break

        //Tags
        case "Tag":
          switch(value.operation){
            case 'INSERT':
              setTags(prevTags => [...prevTags, value.data])
              break

            case 'DELETE':
              setTags(prevTags => [...prevTags.filter(i => i.id !== value.data.id)])
              break

            case 'TRUNCATE':
              setTags(prevTags => [...[]])
              break

            case 'UPDATE':
              setTags(prevTags => [...prevTags.map(i => { return i.id === value.data.id ? value.data : i })])
              break

            default:
              break
          }
          break

        //Devices
        case "Device":
          switch(value.operation){
            case 'INSERT':
              setDevices(prevDevices => [...prevDevices, value.data])
              break

            case 'DELETE':
              setDevices(prevDevices => [...prevDevices.filter(i => i.id !== value.data.id)])
              break

            case 'TRUNCATE':
              setDevices(prevDevices => [...[]])
              break

            case 'UPDATE':
              setDevices(prevDevices => [...prevDevices.map(i => { return i.id === value.data.id ? value.data : i })])
              break
              
            default:
              break
          }
          break

        default:
          break
      }

      // Fetch updated controls
      try {
        const response = await axios.post('http://localhost:3001/api/getAllControls');
        setControls(response.data.result);
        addMessage({ children: response.data.message });
      } catch (error) {
        console.log(error);
      }
    }

    const on_close = (...args) => {
      console.log("socket closed:", args[0])
      setBackendStatus(prevStatus => ({ ...prevStatus, backendConnected: false }))
    }

    const on_db_connected = () => {
      console.log("Web Socket event received: dbConnected")
      setBackendStatus(prevStatus => ({ ...prevStatus, dbConnected: true }))
      retrieveData()
    }

    const on_db_disconnected = () => {
      console.log("Web Socket event received: dbDisconnected")
      setBackendStatus(prevStatus => ({ ...prevStatus, dbConnected: false }))
    }

    const on_mqtt_connected = () => {
      console.log("Web Socket event received: mqttConnected")
      setBackendStatus(prevStatus => ({ ...prevStatus, mqttConnected: true }))
    }

    const on_mqtt_disconnected = () => {
      console.log("Web Socket event received: mqttDisconnected")
      setBackendStatus(prevStatus => ({ ...prevStatus, mqttConnected: false }))
    }

    //On component load request the lists
    if(init === false){
      retrieveData()
    }

    //On (re)connection request the lists
    socket.on("connect", on_connect)
    
    //Connect arror logging
    socket.on("connect_error", on_connect_error)

    //Error logging
    socket.on("error", on_error)

    //on update
    socket.on('update', on_update)

    //on close
    socket.on('close', on_close)

    //on dbConnected
    socket.on('dbConnected', on_db_connected)

    //on dbDisconnected
    socket.on('dbDisconnected', on_db_disconnected)

    //on mqttConnected
    socket.on('mqttConnected', on_mqtt_connected)

    //on mqttDisconnected
    socket.on('mqttDisconnected', on_mqtt_disconnected)

    //dismantling listeners
    return () => {
      socket.off("connect", on_connect)
      socket.off("connect_error", on_connect_error)
      socket.off("error", on_error)
      socket.off("update", on_update)
      socket.off('close', on_close)
      socket.off('dbConnected', on_db_connected)
      socket.off('dbDisconnected', on_db_disconnected)
      socket.off('mqttConnected', on_mqtt_connected)
      socket.off('mqttDisconnected', on_mqtt_disconnected)
    }
  }, [addMessage, init, backendStatus, logicStates, socket, types, fields, ums, vars, tags, devices, controls])

  const value = useMemo(
    () => ({ init, setInit, backendStatus, setBackendStatus, types, setTypes, fields, setFields, ums, setUms, logicStates, setLogicStates, vars, setVars, tags, setTags, devices, setDevices, controls, setControls }),
    [init, setInit, backendStatus, setBackendStatus, types, setTypes, fields, setFields, ums, setUms, logicStates, setLogicStates, vars, setVars, tags, setTags, devices, setDevices, controls, setControls]
  );

  return (
    <ctxData.Provider value={value}>
      {children}
    </ctxData.Provider>
  )

}