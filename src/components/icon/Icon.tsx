import React from "react";
import * as Icons from "@/assets/svg";

type IconProps = {
  width?: number;
  height?: number;
  color?: string;
  style?: React.CSSProperties;
};

const withProps = (IconComponent: React.FC<any>) => {
  return ({ width = 24, height = 24, color = "black", style }: IconProps) => (
    <IconComponent width={width} height={height} fill={color} style={style} />
  );
};

const SvgIcon = {
  AppLogoLight: withProps(Icons.AppLogoLight),
  AppLogoDark: withProps(Icons.AppLogoDark),
};

export default SvgIcon;
