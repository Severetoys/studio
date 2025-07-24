
import { createDataConnect, type CreateUser, type UpdateUserFaceEmbedding, type User, type Users } from '../client';

export const dc = createDataConnect({
  // Note: The location is automatically inferred from the serviceId
  // and does not need to be specified.
  serviceId: 'authkit-y9vjx-service',
});

// Export the types so they can be used in other parts of the application.
export type { CreateUser, UpdateUserFaceEmbedding, User, Users };
