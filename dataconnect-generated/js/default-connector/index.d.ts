import { ConnectorConfig } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface MediaAsset_Key {
  id: UUIDString;
  __typename?: 'MediaAsset_Key';
}

export interface PlatformPost_Key {
  postId: UUIDString;
  socialAccountId: UUIDString;
  __typename?: 'PlatformPost_Key';
}

export interface Post_Key {
  id: UUIDString;
  __typename?: 'Post_Key';
}

export interface ProductService_Key {
  id: UUIDString;
  __typename?: 'ProductService_Key';
}

export interface SocialAccount_Key {
  id: UUIDString;
  __typename?: 'SocialAccount_Key';
}

export interface Transaction_Key {
  id: UUIDString;
  __typename?: 'Transaction_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

