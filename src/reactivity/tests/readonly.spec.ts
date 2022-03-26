import { isProxy, isReadonly, readonly } from "../reactive";

describe("reactivty", () => {
  it("happy path", () => {
    const original = { age: 18 };
    const observed = readonly<{ age: number }>(original);
    //  reactive 与 original 不同
    expect(original).not.toBe(observed);
    //  判断 observed.count 是否等于 18
    expect(observed.age).toBe(18);
  });

  // 修改 readonly 值是否会弹出警告
  it("readonly warning", () => {
    console.warn = jest.fn();
    const user = { age: 18 };
    const observed = readonly<{ age: number }>(user);
    observed.age = 19;
    expect(console.warn).toBeCalled();
  });

  // 是否是 只读 对象
  it("is readonly", () => {
    const person = readonly({
      age: 18,
    });

    expect(isReadonly(person)).toBe(true);
  });

  // 嵌套数据 只读对象
  it("depth object readonly", () => {
    const original = {
      age: 18,
      company: {
        name: "test",
        members: 18,
      },
      friends: ["Tom", "Jack"],
    };
    const observed = readonly(original);
    expect(isReadonly(observed.company)).toBe(true);
    expect(isReadonly(observed.friends)).toBe(true);
  });

  // 是否是 只读 对象
  it("is proxy", () => {
    const person = readonly({
      age: 18,
    });

    expect(isProxy(person)).toBe(true);
  });
});
