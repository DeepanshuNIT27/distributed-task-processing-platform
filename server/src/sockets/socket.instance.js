let io;

export const setIO = (serverIO) => {
  io = serverIO;
};

export const getIO = () => {
  if (!io) {
    console.warn("⚠️ Socket.io instance is not initialized yet!");
  }
  return io;
};
