
"use client";

import { useEffect } from "react";
import { useDyteClient, DyteProvider } from "@dytesdk/react-web-core";
import { DyteMeeting } from "@dytesdk/react-ui-kit";

interface DyteMeetingProps {
    show: boolean;
    onClose: () => void;
}

// Usaremos um authToken e roomName de placeholder.
// Em um aplicativo real, eles seriam gerados dinamicamente no backend
// e passados para este componente.
const authToken = "YOUR_AUTH_TOKEN"; // Substitua por um token real para teste
const roomName = "YOUR_ROOM_NAME"; // Substitua por um nome de sala real para teste

export default function DyteMeetingComponent({ show, onClose }: DyteMeetingProps) {
  const [meeting, initMeeting] = useDyteClient();

  useEffect(() => {
    if(show) {
        initMeeting({
            authToken,
            roomName,
            defaults: {
                audio: false,
                video: false,
            },
        });
    }
  }, [show]);

  useEffect(() => {
    if (meeting) {
      meeting.on('meetingRoomLeft', () => {
        onClose();
      });
    }
  }, [meeting, onClose]);

  return (
    <DyteProvider client={meeting}>
        <DyteMeeting meeting={meeting} showSetupScreen={true} />
    </DyteProvider>
  );
}
