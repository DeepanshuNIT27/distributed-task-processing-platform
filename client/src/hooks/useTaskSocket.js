import { useEffect } from "react";
import { socket } from "../services/socket";

export const useTaskSocket = (taskId, onEvent) => {
  useEffect(() => {
    if (!taskId) return;

    socket.connect();
    socket.emit("join-task-room", taskId);

    socket.on("TASK_PROCESSING", (data) => onEvent("processing", data));
    socket.on("TASK_PROGRESS", (data) => onEvent("progress", data));
    socket.on("TASK_COMPLETED", (data) => onEvent("completed", data));
    socket.on("TASK_FAILED", (data) => onEvent("failed", data));

    return () => {
      socket.emit("leave-task-room", taskId);
      socket.removeAllListeners(); // ⚡ SDE Polish: Safer cleanup than multiple .off() calls
      socket.disconnect();
    };
  }, [taskId, onEvent]);
};
