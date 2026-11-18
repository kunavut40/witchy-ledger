interface Window {
  WitchyNative?: {
    exportFile(name: string, content: string, mime: string): void;
  };
}

interface Window {
  WitchyBack?: () => boolean;
}
