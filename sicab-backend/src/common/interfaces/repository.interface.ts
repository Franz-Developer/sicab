// C:\sistemas\sicab\sicab-backend\src\common\interfaces\repository.interface.ts

export interface IRepository<T = any> {
    findOne(options: any): Promise<T | null>;
    find(options?: any): Promise<T[]>;
    save(entity: T): Promise<T>;
    update(criteria: any, partialEntity: any): Promise<any>;
    delete(criteria: any): Promise<any>;
    query(query: string, parameters?: any[]): Promise<any>;
    create(entity: any): T;
}

export interface IDataSource {
    query(query: string, parameters?: any[]): Promise<any>;
    createQueryRunner(): IQueryRunner;
    escapeIdentifier(identifier: string): string;
}

export interface IQueryRunner {
    connect(): Promise<void>;
    query(query: string, parameters?: any[]): Promise<any>;
    release(): Promise<void>;
    startTransaction(): Promise<void>;
    commitTransaction(): Promise<void>;
    rollbackTransaction(): Promise<void>;
}
