import { useEffect } from "react";

const APP_NAME = "MeetFlow";

const usePageTitle = (title?: string) => {
  useEffect(() => {
    document.title = title ? `${title} | ${APP_NAME}` : APP_NAME;
  }, [title]);
};

export default usePageTitle;
