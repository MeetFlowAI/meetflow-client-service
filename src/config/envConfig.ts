// ----------------------------------------------------------------------

export const envConfig = {
  apiBaseUrl:
    import.meta.env.VITE_APP_API_BASE_URL ||
    "https://api.meetflow.builtbyag09.tech/api/v1",
  accessTokenKey:
    import.meta.env.VITE_APP_ACCESS_TOKEN_KEY || "meetflow_access_token",
  refreshTokenKey:
    import.meta.env.VITE_APP_REFRESH_TOKEN_KEY || "meetflow_refresh_token",
  streamApiKey: import.meta.env.VITE_APP_STREAM_API_KEY || "xzbz37m33pfp",
};
