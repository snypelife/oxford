declare function oxford(dictionaries: oxford.Dictionary[]): oxford.Oxford;

declare namespace oxford {
  type Dictionary = object;

  type Selector = string;

  type ParseArgument = string | number;

  type ChildSelector = string;

  interface Oxford {
    dictionary: Dictionary;
    get(selector: Selector, ...args: ParseArgument[]);
    child(childPath: ChildSelector): Oxford
  }

  enum PluginHook {
    'prebuild',
    'postbuild',
    'preget',
    'postget',
    'static'
  }

  type PluginSpec = string | {
    hook: PluginHook,
    name: string,
    method: (args: any) => any
  }

  export function registerPlugin(spec: PluginSpec): void;
}

export = oxford;
