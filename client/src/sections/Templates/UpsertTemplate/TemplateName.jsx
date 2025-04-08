import { useState, useContext } from "react"
import { useAddMessage } from "@react-md/alert"
import { Button } from '@react-md/button'
import {
  Form,
  TextField,
  FormThemeProvider
} from '@react-md/form'
import {ctxData} from "../../../Helpers/CtxProvider"
import { UpsertTemplateContext } from './UpsertTemplateContext'
import formStyles from '../../../styles/Form.module.scss'

function TemplateName (props) {
  const ctx = useContext(ctxData)
  const addMessage = useAddMessage()
  const {upsertTemplate, setUpsertTemplate} = useContext(UpsertTemplateContext)
  const [prevName, setPrevName] = useState(upsertTemplate.name)


  //Input Validation
  const InlineValidation = (value) => {
    let pattern = /[^A-Za-z0-9_]|^[^A-Za-z_]/
    const isPatternInvalid = pattern.test(value)
    setUpsertTemplate((prevState) => ({...prevState, name: value, templateNameNotValid: isPatternInvalid || ctx.templates.find(i => i.name === value && i.id !== upsertTemplate.template) || value === ""}))
  }


  //Form Events
  const handleSubmit = (event) => {
    event.preventDefault()
    //si chiama una promise in arrivo dalle props. La funzione deve eseguire la query di creazione, sul then poi bisogna resettare il form
    return props.upsertTemplate()
    .then(()=>{
      addMessage({children: "Template updated or inserted"})
    })
    .catch(error => {
      if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      addMessage({children: "Error: " + error.response.data.message})
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        addMessage({children: "Error: database not reachable"})
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        addMessage({children: "Error: wrong request parameters"})
        console.log('Error', error.message);
      }
      console.log(error.config);
    })
    .finally(handleReset)
  }

  const handleReset = () => {
    props.reset()
  }

  return(
    <div className={formStyles.container}>
    <FormThemeProvider theme='outline'>
      <Form className={formStyles.form} onSubmit={handleSubmit}  onReset={handleReset}>
        <TextField
          id='name'
          key='name'
          type='string'
          label="Template Name"
          className={formStyles.item}
          value={upsertTemplate.name}
          onChange={(e) => InlineValidation(e.target.value)}
          onBlur={(e) => {
            if (prevName !== upsertTemplate.name && !upsertTemplate.templateNameNotValid) {
              upsertTemplate.create ? 
              setUpsertTemplate((prevState) => ({...prevState, templateNameQuery: `INSERT INTO "Template" (id, name) VALUES (DEFAULT, '${upsertTemplate.name}') RETURNING id INTO templateId;`})) :
              setUpsertTemplate((prevState) => ({...prevState, templateNameQuery: `UPDATE "Template" SET name='${upsertTemplate.name}' WHERE id = ${upsertTemplate.template} RETURNING id INTO templateId;`}))
              setPrevName(upsertTemplate.name)
            }
          }}
          error={upsertTemplate.templateNameNotValid}
        />
        <div className={formStyles.btn_container}>
          <Button
            type="submit"
            theme="primary"
            themeType="outline"
            className={formStyles.btn}
            disabled={upsertTemplate.templateNameNotValid || upsertTemplate.vars.length === 0}
          >
            Save Template
          </Button>
          <Button
            type="reset"
            themeType="outline"
            className={formStyles.btn}
          >
            Cancel
          </Button>
        </div>
      </Form>
    </FormThemeProvider>
    </div>
  )}
export default TemplateName