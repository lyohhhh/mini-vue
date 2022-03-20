import { readonly } from "../reactive";

describe("reactivty", () => {
  it("happy path", () => {
    const original = { age: 18 };
    const observed = readonly<{ age: number }>(original);
    //  reactive 与 original 不同
    expect(original).not.toBe(observed);
    //  判断 observed.count 是否等于 18
    expect(observed.age).toBe(18);
  });

  it("readonly warning", () => {
    console.warn = jest.fn();
    const user = { age: 18 };
    const observed = readonly<{ age: number }>(user);
    observed.age = 19;
    expect(console.warn).toBeCalled();
  });
});
