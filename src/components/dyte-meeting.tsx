"use client";

// import { useEffect } from 'react';
// import { useDyteClient, DyteProvider } from '@dytesdk/react-web-core';
// import { DyteMeeting } from '@dytesdk/react-ui-kit';

// // As credenciais da Dyte deveriam vir de um backend seguro em um app de produção.
// // Para este exemplo, estamos usando valores estáticos.
// const DYTE_ORG_ID = 'e447d5e6-c1f0-4961-b552-628c6a85ec35';
// const DYTE_API_KEY = 'e61e0915a7724b7e80e1';
// const DYTE_ROOM_NAME = 'vzefpbd-lkjhmg';

// interface DyteMeetingComponentProps {
//   show: boolean;
//   onClose: () => void;
// }

// // O componente que inicializa o cliente e renderiza a reunião.
// const Meeting = ({ show, onClose }: DyteMeetingComponentProps) => {
//   const [meeting, initMeeting] = useDyteClient();

//   useEffect(() => {
//     if (show) {
//       initMeeting({
//         authToken: '', // O authToken será gerado no backend.
//         roomName: DYTE_ROOM_NAME,
//         defaults: {
//           audio: false,
//           video: false,
//         },
//       });
//     }
//   }, [show, initMeeting]);
  
//   // Adiciona um listener para o evento 'meeting:ended'
//   useEffect(() => {
//     if (meeting) {
//       meeting.on('meeting:ended', onClose);
//     }
//     // Cleanup
//     return () => {
//       if (meeting) {
//         meeting.removeListener('meeting:ended', onClose);
//       }
//     };
//   }, [meeting, onClose]);

//   if (!show || !meeting) return null;

//   return (
//     <DyteMeeting
//       meeting={meeting}
//       showSetupScreen={true}
//       style={{ height: '100vh', width: '100vw' }}
//     />
//   );
// };

// // O wrapper principal que fornece o contexto da Dyte.
// const DyteMeetingComponent = ({ show, onClose }: DyteMeetingComponentProps) => {
//     return (
//         <DyteProvider
//             value={undefined}
//             fallback={
//                 <div className="flex h-full w-full items-center justify-center bg-black text-white">
//                     Carregando provedor de vídeo...
//                 </div>
//             }
//         >
//            <Meeting show={show} onClose={onClose} />
//         </DyteProvider>
//     );
// };

// export default DyteMeetingComponent;

// NOTE: This component is temporarily disabled due to issues with its dependencies.
export default function DyteMeetingComponent() {
    return null;
}
