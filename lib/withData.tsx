import * as React from 'react';
import initEnvironment, { EnvSettings } from './createRelayEnvironment';
import { fetchQuery } from 'react-relay';
import { Environment, GraphQLTaggedNode, Variables, Record } from 'react-relay';
import { NextRouter } from '../utils/types';
import ErrorBoundary from '../components/ErrorBoundary';
import {
  Layout,
  LayoutSettings,
  ContentRenererProps,
} from '../components/Layout';
import { QueryRenderer } from 'react-relay';
import { withRouter } from 'next/router';
const dayjs = require('dayjs');
require('dayjs/locale/nb');
dayjs.locale('nb');

export type DataOptions = {
  variables?: Variables | ((arg0: NextRouter) => Variables);
  query?: GraphQLTaggedNode;
};

export type WithDataBaseProps = {
  variables: Variables;
  environment: Environment;
  query: GraphQLTaggedNode;
  queryProps?: any;
  router: NextRouter;
};
export type WithDataDataProps<T> = {
  props?: T | null | undefined;
  error: Error | null;
};

export type WithDataProps<T> = WithDataDataProps<T> & WithDataBaseProps;

type State = {};
type Props = {
  queryRecords: Record;
  router: NextRouter;
  envSettings: EnvSettings;
  ctx: NextRouter;
};

const getOptions = (options: DataOptions, router: NextRouter): DataOptions => {
  const { variables: localVariables, query } = options;
  const variables =
    typeof localVariables === 'function'
      ? localVariables(router)
      : localVariables;

  return { variables, query };
};
export const withData = <T extends {}>(
  ComposedComponent: React.ComponentType<WithDataProps<T>> & {
    getInitialProps?: (
      arg0: Record<string, any>
    ) => Promise<Record<string, any>> | Record<string, any>;
  },
  options: DataOptions
): JSX.Element => {
  return withRouter(
    class WithData extends React.Component<Props, State> {
      static displayName = `WithData(${ComposedComponent.displayName})`;
      environment: Environment;

      static async getInitialProps(ctx: any): Promise<WithDataProps<T> | {}> {
        const localOptions = getOptions(options, ctx);
        // $FlowFixMe
        if (process.browser) {
          if (!ComposedComponent.getInitialProps) {
            return {};
          }
          return await ComposedComponent.getInitialProps(ctx);
        }

        let queryProps = {};
        let queryRecords = {};

        const envSettings: EnvSettings = {
          ravenPublicDsn: process.env.RAVEN_PUBLIC_DSN || '',
          release: process.env.RELEASE || 'dev',
          relayEndpoint:
            process.env.RELAY_ENDPOINT || 'http://localhost:8000/graphql',
        };
        const environment: Environment = initEnvironment({
          envSettings,
        });

        if (localOptions.query) {
          // Provide the `url` prop data in case a graphql query uses it
          // const url = { query: ctx.query, pathname: ctx.pathname }
          // TODO: Consider RelayQueryResponseCache
          // https://github.com/facebook/relay/issues/1687#issuecomment-302931855
          queryProps = await fetchQuery(
            environment,
            localOptions.query,
            localOptions.variables || {}
          );
        }

        let composedProps;
        if (ComposedComponent.getInitialProps)
          composedProps = await ComposedComponent.getInitialProps({
            ...ctx,
            environment,
            queryProps,
          });

        queryRecords = environment.getStore().getSource().toJSON();

        return {
          ...composedProps,
          queryProps,
          queryRecords,
          envSettings,
        };
      }

      constructor(props: Props) {
        super(props);
        const { envSettings } = props;
        this.environment = initEnvironment({
          records: props.queryRecords,
          envSettings,
        });
      }

      render(): JSX.Element {
        const { query, variables } = getOptions(options, this.props.router);
        return (
          <ErrorBoundary resetOnChange={this.props.router}>
            <QueryRenderer
              query={query}
              environment={this.environment}
              fetchPolicy={'store-and-network'}
              variables={variables}
              render={({ props, error }): JSX.Element => (
                <ComposedComponent
                  router={this.props.router}
                  props={props}
                  error={error}
                  environment={this.environment}
                  query={query}
                  variables={variables}
                />
              )}
            />
          </ErrorBoundary>
        );
      }
    }
  );
};

export type DataLayoutOptions<T> = DataOptions & {
  layout?:
    | LayoutSettings<T>
    | ((props: WithDataDataProps<T>) => LayoutSettings<T>);
};
export type WithDataAndLayoutProps<T> = WithDataBaseProps &
  ContentRenererProps<T>;

export const withDataAndLayout = <T extends {}>(
  ComposedComponent: React.ComponentType<WithDataAndLayoutProps<T>>,
  { layout = {}, ...withDataRest }: DataLayoutOptions<T>
): JSX.Element =>
  withData(
    ({ props, error, ...rest }) => (
      <Layout
        {...(typeof layout === 'object' ? layout : layout({ props, error }))}
        contentRenderer={({ props, error }): JSX.Element => (
          <ComposedComponent {...rest} props={props} error={error} />
        )}
        props={props}
        error={error}
      />
    ),
    withDataRest
  );
export default withData;
