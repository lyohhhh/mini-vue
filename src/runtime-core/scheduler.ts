// 同步代码队列
const queue: Function[] = [];

let isFlushPending = false;

let p = Promise.resolve();

// 添加队列
export const queueJobs = (job: Function) => {
  // 不存在再添加
  if (!queue.includes(job)) {
    queue.push(job);
  }

  // 调用微任务执行
  queueFlush();
};

// nextTick
export const nextTick = (fn: any) => {
  return fn ? p.then(fn) : p;
};

const queueFlush = () => {
  if (isFlushPending) return;
  isFlushPending = true;

  nextTick(flushJobs);
};

const flushJobs = () => {
  // 使用微任务 判断队列中是否有未执行的任务
  // 有的话直接执行
  isFlushPending = false;
  let job;
  while ((job = queue.shift())) {
    job && job();
  }
};
