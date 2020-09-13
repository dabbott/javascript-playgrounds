export interface IEnvironment {
  initialize(): Promise<void>
  hasModule(name: string): boolean
  requireModule(name: string): unknown
  beforeEvaluate(options: { host?: HTMLDivElement }): void
  afterEvaluate(options: { entry: string; host: HTMLDivElement }): void
}
