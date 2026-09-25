import type { AxiosInstance } from "axios";

export declare const apiHttpClient: AxiosInstance;

export declare class CustomEntity {
  constructor(entityName: string);
  entityName: string;
  endpoint: string;
  list(options?: any): Promise<any>;
  filter(query?: Record<string, any>): Promise<any[]>;
  get(id: string): Promise<any>;
  create(data: Record<string, any>): Promise<any>;
  update(id: string, data: Record<string, any>): Promise<any>;
  delete(id: string): Promise<any>;
}

export declare const primeos: {
  entities: Record<string, CustomEntity>;
  auth: {
    getUser: () => Promise<any>;
    login: (credentials: any) => Promise<any>;
    logout: () => Promise<void>;
  };
  functions: {
    invoke: (functionName: string, payload?: any) => Promise<any>;
  };
  appLogs: {
    logUserAction: (action: string, details?: any) => Promise<any>;
  };
};

export default primeos;
