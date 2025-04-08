import { HomeFontIcon, AllOutFontIcon, SettingsInputComponentFontIcon, DevicesOtherFontIcon, BatteryUnknownFontIcon, TransformFontIcon, ErrorFontIcon } from "@react-md/material-icons";

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
  "/": createRoute("/", "Home", <HomeFontIcon />),
  "/types": createRoute("/types", "Types", <AllOutFontIcon />),
  "/um": createRoute("/um", "um", <TransformFontIcon />),
  "/logicState": createRoute("/logicState", "Logic State", <TransformFontIcon />),
  "/templates": createRoute("/templates", "Device Templates", <BatteryUnknownFontIcon />),
  "/devices": createRoute("/devices", "Devices", <DevicesOtherFontIcon />),
  "/alarms": createRoute("/alarms", "Alarms", <ErrorFontIcon />),
  "/tags": createRoute("/tags", "Tags", <SettingsInputComponentFontIcon />),
  "/controls": createRoute("/controls", "Controls", <SettingsInputComponentFontIcon />),
};

export default navItems;