declare module 'react-native-web' {
  export namespace AppRegistry {
    export function registerComponent(name: string, thunk: () => any): void
    export function runApplication(
      name: string,
      options: { rootTag: HTMLElement }
    ): void
  }
}
