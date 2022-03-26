import { isReadonly, shallowReadonly } from "../reactive";

describe("shallowReadonly", () => {
  // 第一层进行 readonly 深层次不变
  it("show shallow reaconly", () => {
    const original = {
      name: "test",
      school: {
        name: "school",
      },
    };

    const shallow = shallowReadonly(original);

    expect(isReadonly(shallow)).toBe(true);
    expect(isReadonly(shallow.school)).toBe(false);
  });

  // 修改 readonly 值是否会弹出警告
  it("shallowReadonly warning", () => {
    console.warn = jest.fn();
    const user = { age: 18 };
    const observed = shallowReadonly<{ age: number }>(user);
    observed.age = 19;
    expect(console.warn).toBeCalled();
  });
});
