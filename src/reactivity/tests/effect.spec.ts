import { effect, stop } from "../effect";
import { reactive } from "../reactive";

describe("effect", () => {
  it("happy path", () => {
    const original = { age: 18 };
    const observed = reactive<{ age: number }>(original);
    //  reactive 与 original 不同
    expect(original).not.toBe(observed);
    //  判断 observed.count 是否等于 18
    expect(observed.age).toBe(18);
    observed.age = 19;
    expect(observed.age).toBe(19);
  });

  it("test effect running return func", () => {
    // effect( fn ) => return fn = runner  => fn => return
    /**
     * 初始化执行 = runner = () => {
     *                  count++;
     *                  return "test return";
     *              }
     *
     * runner 执行 => count++ = 3 => 返回值 "test return";
     */
    let age = 18;
    const runner = effect(() => {
      age++;
      return "test return";
    });
    // 初始化执行
    expect(age).toBe(19);
    // 返回函数执行
    const result = runner();
    // count ++
    expect(age).toBe(20);
    // 返回字符串
    expect(result).toBe("test return");
  });

  it("scheduler", () => {
    /**
     * 1. effect 获取两个参数
     * 2. 初始化时 scheduler 不会被执行。 第一个参数函数依然会被执行
     * 3. 响应式发生 set 时 scheduler 执行。 第一个参数不会被执行
     * 4. 执行 runner 时， 第一个参数函数会被执行
     */
    let count;
    let run: any;
    const scheduler = jest.fn(() => {
      run = runner;
    });

    const obj = reactive({ age: 1 });
    const runner = effect(
      () => {
        count = obj.age;
      },
      {
        scheduler,
      }
    );
    // 第一次 scheduler 不会被执行
    expect(scheduler).not.toHaveBeenCalled();
    // fn => 第一个参数被执行  runner => 第一个参数
    expect(count).toBe(1);
    // 发生 set 时 执行 => trigger => 判断 scheduler
    obj.age++;
    // scheduler 存在执行 scheduler
    expect(scheduler).toHaveBeenCalledTimes(1);
    // 不执行 fn
    expect(count).toBe(1);
    // 执行第一个参数  obj.age => 2
    run();
    // count == 2
    expect(count).toBe(2);
  });

  it("stop", () => {
    let dummy;
    const obj = reactive({ age: 18 });
    const runner = effect(() => {
      dummy = obj.age;
    });
    obj.age;
    obj.age = 19;
    expect(dummy).toBe(19);
    // stop 之后清除了 收集的依赖 -> set 时应该不会重新触发依赖
    stop(runner);
    // get 又重新收集依赖 -> 导致 set 操作时又会触发依赖
    console.log(obj.age);
    obj.age = 20;
    expect(dummy).toBe(19);
    runner();
    expect(dummy).toBe(20);
  });

  it("onStop", () => {
    const obj = reactive({ age: 18 });

    const onStop = jest.fn();
    let dummy;
    const runner = effect(
      () => {
        dummy = obj.age;
      },
      { onStop }
    );
    stop(runner);
    expect(onStop).toBeCalledTimes(1);
  });
});
