export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Query = {
  __typename?: 'Query';
  hello?: Maybe<Sample>;
  helloLambda?: Maybe<HelloLambda>;
  helloList?: Maybe<SampleConnection>;
};


export type QueryHelloArgs = {
  id: Scalars['ID'];
};


export type QueryHelloLambdaArgs = {
  name: Scalars['String'];
};

export type Sample = {
  __typename?: 'Sample';
  child?: Maybe<Array<Maybe<SampleChild>>>;
  key1: Scalars['ID'];
  key2?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

export type SampleChild = {
  __typename?: 'SampleChild';
  childValue?: Maybe<Scalars['String']>;
  key1: Scalars['ID'];
  key2?: Maybe<Scalars['String']>;
};

export type HelloLambda = {
  __typename?: 'HelloLambda';
  message: Scalars['String'];
};

export type SampleConnection = {
  __typename?: 'SampleConnection';
  items?: Maybe<Array<Maybe<Sample>>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  create?: Maybe<Sample>;
};


export type MutationCreateArgs = {
  input: CreateInput;
};

export type CreateInput = {
  id: Scalars['ID'];
  value?: InputMaybe<Scalars['String']>;
};

export type Subscription = {
  __typename?: 'Subscription';
  subscribeToNewSample?: Maybe<Sample>;
};


export type SubscriptionSubscribeToNewSampleArgs = {
  id: Scalars['ID'];
};
