import { effect } from "../effect";
import { isReactive, shallowReactive } from "../reactive";

describe("shallow reactive", () => {
  it(" not depth reactive", () => {
    let original = shallowReactive({
      name: "test",
      deep: {
        age: 10,
      },
    });

    expect(isReactive(original)).toBe(true);
    expect(isReactive(original.deep)).toBe(false);
  });

  it(" effect test shallow reactive", () => {
    let original = shallowReactive({
      name: "test",
      deep: {
        age: 10,
      },
    });
    let count;
    effect(() => {
      // 执行 get 收集依赖
      original.name;
      // 不是深度 original.deep.age 执行 get 收集不到依赖
      count = original.deep.age;
    });

    // 执行第一次收集依赖
    expect(count).toBe(10);
    // 不是深度
    // 改变 deep 没有触发依赖
    original.deep.age = 11;
    // count -> 10  original.deep.age -> 11
    expect(count).toBe(10);
    // 改变 name 触发依赖
    original.name = "Tom";
    expect(count).toBe(11);
  });
});
