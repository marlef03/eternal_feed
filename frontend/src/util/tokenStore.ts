let accessToken: string | null = null;

const tokenStore = {
  get: () => accessToken,

  set: (token: string) => {
    accessToken = token;
  },

  clear: () => {
    accessToken = null;
  },
};

export default tokenStore;
