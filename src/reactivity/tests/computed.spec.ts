import { computed } from "../computed";
import { reactive } from "../reactive";

describe("computed", () => {
  it("happy path ", () => {
    const user = reactive({
      age: 18,
    });
    const age = computed(() => user.age);
    expect(age.value).toBe(18);
  });

  it("compute lazily", () => {
    const user = reactive({
      age: 18,
    });
    const getter = jest.fn(() => user.age);
    const val = computed(getter);

    // lazy 不执行 .value 时不会被调用
    expect(getter).not.toHaveBeenCalled();
    // 执行 .value getter 应该被调用一次
    // 执行了 getter -> 触发 user get -> 收集依赖
    expect(val.value).toBe(18);
    expect(getter).toHaveBeenCalledTimes(1);

    // 值没有改变 computed 应该直接从缓存里取值 不调用函数
    val.value;
    expect(getter).toHaveBeenCalledTimes(1);

    // 发生改变不执行 .value 时不会被调用
    // 触发依赖
    user.age = 19;
    expect(getter).toHaveBeenCalledTimes(1);

    // 执行 .value getter 应该被调用两次
    expect(val.value).toBe(19);
    expect(getter).toHaveBeenCalledTimes(2);

    // 值没有改变 computed 应该直接从缓存里取值 不调用函数
    val.value;
    expect(getter).toHaveBeenCalledTimes(2);
  });
});
