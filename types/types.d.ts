declare interface Route {
  src: string;
  dest: string;
  headers?: {
    [key: string]: string;
  };
  status?: number;
  methods?: string[];
}

declare interface Build {
  src: string;
  use: string;
}

declare interface Deployment {
  id: string;
  url: string;
  name: string;
  meta: {
    [key: string]: string | number | boolean;
  };
  version: number;
  regions: string[];
  routes: Route[];
  builds: Build[];
  plan: string;
  public: boolean;
  ownerId: string;
  readyState: 'INITIALIZING' | 'ANALYZING' | 'BUILDING' | 'DEPLOYING' | 'READY' | 'ERROR';
  createdAt: string;
  createdIn: string;
  env: {
    [key: string]: string;
  };
  build: {
    env: {
      [key: string]: string;
    };
  };
  target: string;
  alias: string[];
}

declare interface DeploymentBuild {
  id: string;
  use: string;
  createdIn: string;
  deployedTo: string;
  readyState: 'INITIALIZING' | 'ANALYZING' | 'BUILDING' | 'DEPLOYING' | 'READY' | 'ERROR';
  readyStateAt: string;
  path: string;
}

declare interface DeploymentOptions {
  version?: number;
  regions?: string[];
  routes?: Route[];
  builds?: Build[];
  env?: {
    [key: string]: string;
  };
  build?: {
    env: {
      [key: string]: string;
    };
  };
  target?: string;
  token?: string | null;
  teamId?: string;
  name?: string;
  defaultName?: string;
  isDirectory?: boolean;
  path?: string | string[];
}