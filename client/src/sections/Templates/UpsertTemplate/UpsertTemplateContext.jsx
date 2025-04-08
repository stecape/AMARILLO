import React, { createContext, useState, useMemo, useCallback } from "react";

const UpsertTemplateContext = createContext()

const UpsertTemplateContextProvider = ({children}) => {
    const [upsertTemplate, setUpsertTemplate] = useState({
        create: true,
        templateNameQuery: '',
        insertQuery:[],
        updateQuery:[],
        deleteQuery:[],
        name: '',
        template: 0,
        vars: [],
        templateNameNotValid: false,
        varNameNotValid: false
    })

    const initUpsertTemplateContext = useCallback((templates) => {
      setUpsertTemplate({
        create: true,
        templateNameQuery: '',
        insertQuery:[],
        updateQuery:[],
        deleteQuery:[],
        name: '',
        template: 0,
        vars: [],
        templateNameNotValid: false,
        varNameNotValid: false
      })
    },[])

    const value = useMemo(
        () => ({ upsertTemplate, setUpsertTemplate, initUpsertTemplateContext }),
        [upsertTemplate, setUpsertTemplate, initUpsertTemplateContext]
      );

    return (
      // the Provider gives access to the context to its children
      <UpsertTemplateContext.Provider value = {value}>
        {children}
      </UpsertTemplateContext.Provider>
    );
}

export { UpsertTemplateContext, UpsertTemplateContextProvider };