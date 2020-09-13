import type { EvaluationContext } from '../components/player/Sandbox'

export interface IEnvironment {
  initialize(): Promise<void>
  hasModule(name: string): boolean
  requireModule(name: string): unknown
  beforeEvaluate(options: { host?: HTMLDivElement }): void
  afterEvaluate(options: {
    context: EvaluationContext
    host: HTMLDivElement
  }): void
}
