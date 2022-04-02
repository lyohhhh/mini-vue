import { getCurrentInstance } from "./component";

export function provide(key: string | symbol, value: any) {
  const instance = getCurrentInstance();
  if (instance) {
    let { provides } = instance;

    const parentProvides = instance.parent?.provides;
    if (parentProvides === provides) {
      provides = instance.provides = Object.create(parentProvides);
    }

    provides[key] = value;
  }
}

export function inject(key: string) {
  let instance = getCurrentInstance();

  console.log(instance);

  if (instance) {
    const provides = instance.parent?.provides || {};
    if (key in provides) {
      return provides[key];
    }
  }
}
