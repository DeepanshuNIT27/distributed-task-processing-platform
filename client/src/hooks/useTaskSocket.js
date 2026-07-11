import { useEffect } from "react";
import { socket } from "../services/socket";

// 🔥 EXISTING HOOK: For specific Task Details room
export const useTaskSocket = (taskId, onEvent) => {
  useEffect(() => {
    if (!taskId) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join-task-room", taskId);

    const handleProcessing = (data) => onEvent("processing", data);
    const handleProgress = (data) => onEvent("progress", data);
    const handleCompleted = (data) => onEvent("completed", data);
    const handleFailed = (data) => onEvent("failed", data);

    socket.on("TASK_PROCESSING", handleProcessing);
    socket.on("TASK_PROGRESS", handleProgress);
    socket.on("TASK_COMPLETED", handleCompleted);
    socket.on("TASK_FAILED", handleFailed);

    return () => {
      socket.emit("leave-task-room", taskId);
      socket.off("TASK_PROCESSING", handleProcessing);
      socket.off("TASK_PROGRESS", handleProgress);
      socket.off("TASK_COMPLETED", handleCompleted);
      socket.off("TASK_FAILED", handleFailed);
    };
  }, [taskId, onEvent]);
};

// 🔥 NEW HOOK: For Global Dashboard Updates
export const useDashboardSocket = (onGlobalUpdate) => {
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    // Jab bhi backend global chillaayega, yeh function chalega
    socket.on("GLOBAL_TASK_UPDATE", onGlobalUpdate);

    return () => {
      socket.off("GLOBAL_TASK_UPDATE", onGlobalUpdate);
    };
  }, [onGlobalUpdate]);
};
