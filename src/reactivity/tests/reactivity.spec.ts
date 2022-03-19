import { effect } from "../effect";
import { reactive } from "../reactive";

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
    // person.age++;
    // // age => person.age + 1
    // expect(age).toBe(20);
  });
});
