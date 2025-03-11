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
  const [socketStatus, setSocketStatus] = useState({connected: false})
  const [init, setInit] = useState(false)
  const [devices, setDevices] = useState([]);
  const [controls, setControls] = useState([]); //array di oggetti. Ogni oggetto conterrà le tagId appartenenti ad un certo data type
  
  useEffect(() => {

    const on_connect = async () => {
      try {
        setSocketStatus({ connected: true });
    
        const requests = [
          axios.post('http://localhost:3001/api/getAll', { table: "Type", fields: ["name", "id", "base_type", "locked"] }),
          axios.post('http://localhost:3001/api/getAll', { table: "Field", fields: ['id', 'name', 'type', 'parent_type', 'um', 'logic_state', 'comment'] }),
          axios.post('http://localhost:3001/api/getAll', { table: "um", fields: ['id', 'name', 'metric', 'imperial', 'gain', '"offset"'] }),
          axios.post('http://localhost:3001/api/getAll', { table: "LogicState", fields: ['id', 'name', 'value'] }),
          axios.post('http://localhost:3001/api/getAll', { table: "Var", fields: ['id', 'device', 'name', 'type', 'um', 'logic_state', 'comment'] }),
          axios.post('http://localhost:3001/api/getAll', { table: "Tag", fields: ['id', 'name', 'var', 'parent_tag', 'type_field', 'um', 'logic_state', 'comment', 'value'] }),
          axios.post('http://localhost:3001/api/getAll', { table: "Device", fields: ['id', 'name'] }),
          axios.post('http://localhost:3001/api/getAllControls')
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
    
        setDevices(responses[6].data.result.map((val) => ({ id: val[0], name: val[1] })));
        addMessage({ children: responses[6].data.message });
    
        setControls(responses[7].data.result);
        addMessage({ children: responses[7].data.message });
    
      } catch (error) {
        console.log(error);
      }
    
      setInit(true);
    };

    const on_error = (...args) => {
      console.log("socket error:", args[0])
      setSocketStatus({connected: false})
    }

    const on_connect_error = (...args) => {
      console.log("socket connect error:", args[0])
      setSocketStatus({connected: false})
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
      setSocketStatus({connected: false})
    }

    //On component load request the lists
    if(init === false){
      on_connect()
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

    //dismantling listeners
    return () => {
      socket.off("connect", on_connect)
      socket.off("connect_error", on_connect_error)
      socket.off("error", on_error)
      socket.off("update", on_update)
      socket.off('close', on_close)
    }
  }, [addMessage, init, socketStatus, logicStates, socket, types, fields, ums, vars, tags, devices, controls])

  const value = useMemo(
    () => ({ init, setInit, socketStatus, setSocketStatus, types, setTypes, fields, setFields, ums, setUms, logicStates, setLogicStates, vars, setVars, tags, setTags, devices, setDevices, controls, setControls }),
    [init, setInit, socketStatus, setSocketStatus, types, setTypes, fields, setFields, ums, setUms, logicStates, setLogicStates, vars, setVars, tags, setTags, devices, setDevices, controls, setControls]
  );

  return (
    <ctxData.Provider value={value}>
      {children}
    </ctxData.Provider>
  )

}