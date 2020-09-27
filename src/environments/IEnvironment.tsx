import { ExternalModule } from '../components/player/VendorComponents'
import type { PlayerStyles } from '../player'
import type { Message } from '../types/Messages'

declare global {
  interface Window {
    regeneratorRuntime: unknown
    __message: (message: Message) => void
  }
}

export type EvaluationContext = {
  fileMap: Record<string, string>
  entry: string
  requireCache: Record<string, unknown>
}

export interface EnvironmentOptions {
  id: string
  assetRoot: string
  prelude: string
  statusBarHeight: number
  statusBarColor: string
  sharedEnvironment: boolean
  styles: PlayerStyles
  modules: ExternalModule[]
  detectedModules: ExternalModule[]
}

export interface IEnvironment {
  initialize(options: EnvironmentOptions): Promise<void>
}
