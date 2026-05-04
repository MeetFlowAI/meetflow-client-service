/* Imports */
import React, { type JSX } from "react";

/* Local Imports */
import SidebarSectionsListingContainer from "./SidebarSectionsListingContainer";

// ----------------------------------------------------------------------

/* Interface */

/**
 * Interface for the sidebar configuration item, which includes the name, url, and icon for each sidebar entry.
 */
export interface SidebarConfigItem {
  name: string;
  url: string;
  icon: React.ComponentType;
}

export interface SidebarConfigRendererProps {
  config: SidebarConfigItem[];
}

// ----------------------------------------------------------------------

/**
 * Component to render the complete sidebar configuration
 *
 * @component
 * @param {SidebarConfigSection[]} config - The sidebar configuration array
 * @returns {JSX.Element}
 */
const SidebarConfigRenderer: React.FC<SidebarConfigRendererProps> = ({
  config,
}): JSX.Element => {
  return <SidebarSectionsListingContainer sections={config} />;
};

export default SidebarConfigRenderer;
