
import { createDataConnect } from 'dataconnect';

export const dc = createDataConnect({
  // Note: The location is automatically inferred from the serviceId
  // and does not need to be specified.
  serviceId: 'authkit-y9vjx-service',
});
