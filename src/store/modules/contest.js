import { defineStore } from 'pinia'
import api from '@/api'
import { useProblemStore } from '@/store/modules/problem'

export const useContestStore = defineStore('contest', {
  state: () => ({
    list: [],
    sum: 0,
    contest: {},
    overview: [],
    totalProblems: 0,
    ranklist: [],
    solved: [],
    tagMap: {}, // 存储题目对应的标签列表
  }),
  getters: {
    problems: state => state.contest.list,
  },
  actions: {
    async find (payload) {
      const { data } = await api.contest.find(payload)
      this.list = data.list.docs
      this.sum = data.list.total
    },
    async findOne (payload) {
      const { data } = await api.contest.findOne(payload)
      this.contest = data.contest

      const problemStore = useProblemStore()
      await problemStore.find(payload) // 调用 find 方法获取题目信息

      for (let i = 0; i < data.overview.length; i++) {
        const problemId = data.overview[i].pid
        const tags = problemStore.list.find((problem) => problem.pid === problemId)?.tags ?? [] // 获取标签列表
        this.tagMap = { ...this.tagMap, [problemId]: tags } // 将标签信息存储到相应的题目 ID 上
      }
      
      this.overview = data.overview
      this.totalProblems = data.totalProblems
      this.solved = data.solved
      return data
    },
    async getRank (payload) {
      const { data } = await api.contest.rank(payload)
      this.ranklist = normalize(data.ranklist, this.contest)
    },
    create (payload) {
      return api.contest.create(payload).then(({ data }) => data.cid)
    },
    update (payload) {
      return api.contest.update(payload).then(({ data }) => data.cid)
    },
    async delete (payload) {
      await api.contest.delete(payload)
      this.list = this.list.filter(p => p.cid !== +(payload.cid))
    },
    verify (payload) {
      return api.contest.verify(payload).then(({ data }) => data.isVerify)
    },
  },
})

function normalize (ranklist, contest) {
  const list = Object.values(ranklist).map((row) => { // 每一行，也就是每一个用户的成绩
    let solved = 0 // 记录 ac 几道题
    let penalty = 0 // 罚时，尽在 ac 时计算
    for (const pid of contest.list) {
      if (row[pid] == null) continue // 这道题没有交过
      const submission = row[pid]
      if (submission.wa >= 0) { // ac 了
        solved++
        penalty += submission.create - contest.start + submission.wa * 20 * 60 * 1000
      }
    }
    row.solved = solved
    row.penalty = penalty
    return row
  })

  // 排序, 先按照 solved, 在按照 penalty
  list.sort((x, y) => {
    if (x.solved !== y.solved)
      return -(x.solved - y.solved)

    return x.penalty - y.penalty
  })

  // 接下来计算 primes
  const quickest = {} // 每到题最早提交的 ac 时间
  for (const pid of contest.list)
    quickest[pid] = Number.POSITIVE_INFINITY // init

  list.forEach((row) => {
    for (const pid of contest.list) {
      if (row[pid] != null && row[pid].wa >= 0)
        quickest[pid] = Math.min(quickest[pid], row[pid].create)
    }
  })
  list.forEach((row) => {
    for (const pid of contest.list) {
      if (row[pid] == null || row[pid].wa < 0) continue
      if (quickest[pid] === row[pid].create) { // 这就是最早提交的那个
        row[pid].prime = true // 打上标记
      }
    }
  })
  return list
}
