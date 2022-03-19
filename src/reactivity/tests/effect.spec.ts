import { reactive } from "../reactive";

describe("effect", () => {
  it("happy path", () => {
    const original = { count: 1 };
    const observed = reactive<{ count: number }>(original);
    //  reactive 与 original 不同
    expect(original).not.toBe(observed);
    //  判断 observed.count 是否等于 1
    expect(observed.count).toBe(1);
  });
});
