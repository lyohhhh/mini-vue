import { effect } from "../effect";
import { reactive } from "../reactive";
import { isRef, proxyRefs, ref, unRef } from "../ref";

describe("ref", () => {
  it("happy path", () => {
    const a = ref(1);
    expect(a.value).toBe(1);
  });

  it("ref should to reactive", () => {
    const a = ref(1);
    let dummy = 0;
    let b;
    effect(() => {
      dummy++;
      b = a.value;
    });
    expect(dummy).toBe(1);
    expect(b).toBe(1);
    a.value = 2;
    expect(dummy).toBe(2);
    expect(b).toBe(2);
    a.value = 2;
    expect(dummy).toBe(2);
    expect(b).toBe(2);
  });

  it("should make nested properties reactive", () => {
    const a = ref({
      count: 1,
    });

    let dummy;

    effect(() => {
      dummy = a.value.count;
    });

    expect(dummy).toBe(1);
    a.value.count = 2;
    expect(dummy).toBe(2);
  });

  it("isRef", () => {
    let a = ref(1);
    let observed = reactive({
      count: 1,
    });

    expect(isRef(a)).toBe(true);
    expect(isRef(observed)).toBe(false);
    expect(isRef(1)).toBe(false);
  });

  it("unRef", () => {
    let a = ref(1);
    expect(unRef(a)).toBe(1);
    expect(unRef(2)).toBe(2);
  });

  it("proxyRefs", () => {
    let user = {
      age: ref(18),
      name: "Tom",
    };

    let proxyUser = proxyRefs(user);
    expect(proxyUser.age).toBe(18);
    expect(user.age.value).toBe(18);

    proxyUser.age = 28;
    expect(proxyUser.age).toBe(28);
    expect(user.age.value).toBe(28);

    proxyUser.age = ref(30);
    expect(proxyUser.age).toBe(30);
    expect(user.age.value).toBe(30);
  });
});
