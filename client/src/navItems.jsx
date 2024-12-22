import { HomeSVGIcon, AllInclusiveSVGIcon, AllOutSVGIcon, SettingsInputComponentSVGIcon, DevicesOtherSVGIcon, TransformSVGIcon, ErrorSVGIcon } from "@react-md/material-icons";

/**
 * Note: The `parentId` **must** be defaulted to `null` for the navigation tree
 * to render correctly since this uses the @react-md/tree package behind the
 * scenes. Each item that has a `parentId` set to `null` will appear at the root
 * level of your navigation tree.
 */
function createRoute(
  pathname,
  children,
  leftAddon,
  parentId = null
) {
  return {
    itemId: pathname,
    parentId,
    to: pathname,
    children,
    leftAddon,
  };
}

const navItems = {
  "/": createRoute("/", "Home", <HomeSVGIcon />),
  "/types": createRoute("/types", "Types", <AllOutSVGIcon />),
  "/um": createRoute("/um", "um", <TransformSVGIcon />),
  "/logicState": createRoute("/logicState", "Logic State", <TransformSVGIcon />),
  "/devices": createRoute("/devices", "Devices", <DevicesOtherSVGIcon />),
  "/vars": createRoute("/vars", "Vars", <AllInclusiveSVGIcon />),
  "/alarms": createRoute("/alarms", "Alarms", <ErrorSVGIcon />),
  "/tags": createRoute("/tags", "Tags", <SettingsInputComponentSVGIcon />),
};

export default navItems;