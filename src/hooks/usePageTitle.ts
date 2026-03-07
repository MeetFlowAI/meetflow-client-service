import { useEffect } from "react";

const APP_NAME = "Grovia";

const usePageTitle = (title?: string) => {
  useEffect(() => {
    if (title) {
      document.title = `${title} | ${APP_NAME}`;
    } else {
      document.title = APP_NAME;
    }
  }, [title]);
};

export default usePageTitle;
