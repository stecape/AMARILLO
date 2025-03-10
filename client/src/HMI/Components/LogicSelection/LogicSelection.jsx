import React, { useState, useEffect } from 'react';
import { Grid, GridCell } from '@react-md/utils'
import { Button } from "@react-md/button"
import { Typography } from "@react-md/typography"
import gridStyles from "../../../styles/Grid.module.scss"
import axios from 'axios'

function LogicSelection(props) {
  const [tags, setTags] = useState({ commandId: null, statusId: null });

  useEffect(() => {
    // Simulazione di una chiamata API per ottenere gli ID delle tag
    const fetchTagIds = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/tags', {
          params: { LogicSelectionId: props.id }
        });
        const { commandId, statusId } = response.data;
        setTags({ commandId, statusId });
      } catch (error) {
        console.error("Error fetching tag IDs:", error);
      }
    };

    fetchTagIds();
  }, [props.device]);

  return (
    <>
      <Grid>
        <Typography
          id="dialog-title"
          type="subtitle-1"
          margin="none"
          color="secondary"
        >
          {props.name}
        </Typography>
        <GridCell colSpan={12} className={gridStyles.item}>
          <Button onClick={() => axios.post('http://localhost:3001/api/mqtt/write', {device:"Pot", id: 5, value: 1})}>{props.left}</Button>
          <Button onClick={() => axios.post('http://localhost:3001/api/mqtt/write', {device:"Pot", id: 5, value: 2})}>{props.right}</Button>
        </GridCell>
      </Grid>
    </>
  )
}

export default LogicSelection