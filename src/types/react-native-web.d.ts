declare module 'react-native-web' {
  export namespace AppRegistry {
    export function registerComponent(name: string, thunk: () => any): void
    export function getAppKeys(): string[]
    export function runApplication(
      name: string,
      options: { rootTag: HTMLElement }
    ): void
  }
  export namespace Dimensions {
    export function _update(): void
  }
}
