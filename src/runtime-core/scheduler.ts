// 同步代码队列
const queue: Function[] = [];

let isFlushPending = false;

export const queueJobs = (job: Function) => {
  // 不存在再添加
  if (!queue.includes(job)) {
    queue.push(job);
  }

  // 调用微任务执行
  queueFlush();
};

const queueFlush = () => {
  if (isFlushPending) return;
  isFlushPending = true;
  // 使用微任务 判断队列中是否有未执行的任务
  // 有的话直接执行
  Promise.resolve().then(() => {
    isFlushPending = false;
    let job;
    while ((job = queue.shift())) {
      job && job();
    }
  });
};
