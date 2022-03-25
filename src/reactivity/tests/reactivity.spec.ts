import { effect } from "../effect";
import { isReactive, reactive } from "../reactive";

describe("reactivty", () => {
  it("happy path", () => {
    const person = reactive({
      age: 18,
    });

    let age;
    // init 收集依赖 =>  触发依赖
    effect(() => {
      age = person.age + 1;
    });
    // age => person.age + 1
    expect(age).toBe(19);
    // set => 触发依赖 => age => 19
    person.age++;
    // age => person.age + 1
    expect(age).toBe(20);
  });

  it("is reactive", () => {
    const person = reactive({
      age: 18,
    });

    expect(isReactive(person)).toBe(true);
  });
  // TODO
  // 嵌套对象收集依赖 以及触发依赖
  it("watch depth object change", () => {
    const original = {
      age: 18,
      company: {
        name: "test",
        members: 18,
      },
      friends: ["Tom", "Jack"],
    };
    const observed = reactive(original);
    let dummy;
    effect(() => {
      dummy = original.company.members;
    });
    expect(dummy).toBe(18);
    observed.company.members = 19;
    expect(dummy).toBe(19);
  });
});
