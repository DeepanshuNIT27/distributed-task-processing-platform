import { useEffect } from "react";
import { socket } from "../services/socket";

export const useTaskSocket = (taskId, onEvent) => {
  useEffect(() => {
    if (!taskId) return;

    // ⚡ SDE Polish: Connect only if disconnected (prevents multiple handshake calls)
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join-task-room", taskId);

    // Named handlers so we can cleanly remove ONLY these specific listeners
    const handleProcessing = (data) => onEvent("processing", data);
    const handleProgress = (data) => onEvent("progress", data);
    const handleCompleted = (data) => onEvent("completed", data);
    const handleFailed = (data) => onEvent("failed", data);

    socket.on("TASK_PROCESSING", handleProcessing);
    socket.on("TASK_PROGRESS", handleProgress);
    socket.on("TASK_COMPLETED", handleCompleted);
    socket.on("TASK_FAILED", handleFailed);

    return () => {
      // ⚡ SDE Polish: Leave room, but ONLY remove this component's listeners.
      // Do NOT call socket.disconnect() or removeAllListeners() if socket is shared!
      socket.emit("leave-task-room", taskId);
      socket.off("TASK_PROCESSING", handleProcessing);
      socket.off("TASK_PROGRESS", handleProgress);
      socket.off("TASK_COMPLETED", handleCompleted);
      socket.off("TASK_FAILED", handleFailed);
    };
  }, [taskId, onEvent]);
};
