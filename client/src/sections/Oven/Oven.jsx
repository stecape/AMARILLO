import React, { useContext } from "react";
import { Grid, GridCell } from '@react-md/utils';
import { Typography } from "@react-md/typography";
import { WhatshotSVGIcon } from "@react-md/material-icons";

import { ctxData } from "../../Helpers/CtxProvider";
import LogicSelection from "../../HMI/Components/LogicSelection/LogicSelection";
import Set from "../../HMI/Components/Set/Set";
import Act from "../../HMI/Components/Act/Act";
import Pid from "../../HMI/Components/Pid/Pid";
import Profile from "../../HMI/Components/Profile/Profile";

import gridStyles from "../../styles/Grid.module.scss";
import styles from "./Oven.module.scss";

function Oven() {
  const ctx = useContext(ctxData);
  return (
    <div className={styles.ovenSection}>
      {ctx.init && (
        <Grid>
          <GridCell colSpan={4} className={gridStyles.item}>
            <LogicSelection ctrl={ctx.controls.Forno.Heating} label="Heating" />
          </GridCell>
          <GridCell colSpan={4} className={gridStyles.item}>
            <LogicSelection ctrl={ctx.controls.Forno?.Mode} label="Mode" />
          </GridCell>
          <GridCell colSpan={4} className={gridStyles.item}>
            <Set ctrl={ctx.controls.Forno.PowerReference} label="Power Reference" />
          </GridCell>
          <GridCell colSpan={4} className={gridStyles.item}>
            <Set ctrl={ctx.controls.Forno.TemperatureReference} label="Temperature Reference" />
          </GridCell>
          {/* Profile Section */}
          <GridCell colSpan={12} className={gridStyles.item}>
            <Profile ctrl={ctx.controls.Forno?.PID} label="PID" />
          </GridCell>
          {/* Fine Profile Section */}
          <GridCell colSpan={4} className={gridStyles.item}>
            <Act ctrl={ctx.controls.Forno?.ActualTemperature} label="Actual Temperature" />
          </GridCell>
          <GridCell colSpan={4} className={gridStyles.item}>
            <Act ctrl={ctx.controls.Forno?.ActualPower} label="Actual Power" />
          </GridCell>
          {/* PID Section */}
          <GridCell colSpan={12} className={gridStyles.item}>
            <Pid ctrl={ctx.controls.Forno?.PID} label="PID" />
          </GridCell>
          {/* Fine PID Section */}
        </Grid>
      )}
    </div>
  );
}

export default Oven;
