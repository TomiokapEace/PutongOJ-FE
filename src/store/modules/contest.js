import { defineStore } from 'pinia'
import api from '@/api'
import { useProblemStore } from '@/store/modules/problem'

export const useContestStore = defineStore('contest', {
  state: () => ({
    sum: 0,
    contest: {},
    overview: [],
    totalProblems: 0,
    ranklist: [],
    solved: [],
    tagMap: {}, // 存储题目对应的标签列表
    statisticsList: []// 添加饼图所需的数据 statisticsList
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
      // 获取contest题目列表的tag列表
      const payload2 = {
        page: 1, // 或者根据需要设置其他的页码
        pageSize: 9999, // 设置一个足够大的 pageSize 来一次性获取所有题目
      }
      const problemStore = useProblemStore()
      await problemStore.find(payload2) // 调用 find 方法获取题目信息

      for (let i = 0; i < data.overview.length; i++) {
        const problemId = data.overview[i].pid
        const tags = problemStore.list.find((problem) => problem.pid === problemId)?.tags ?? [] // 获取标签列表
        this.tagMap = { ...this.tagMap, [problemId]: tags } // 将标签信息存储到相应的题目 ID 上
      }

      // 获取contest题目列表的指定题目的提交列表
      // 统计不同judge类型的个数
      const statistics = {
        AC: 0,
        CE: 0,
        RE: 0,
        WA: 0,
        TLE: 0,
        MLE: 0,
        OLE: 0,
        PE: 0,
        SE: 0
      }

      const { data: solutionData } = await api.solution.find(payload) // 获取题目对应的solution列表
      let solutionList = solutionData.list.docs
      for (let item of solutionList) {
        switch (item.judge) {
          case 2:
            statistics.CE += 1
            break
          case 3:
            statistics.AC += 1
            break
          case 4:
            statistics.RE += 1
            break
          case 5:
            statistics.WA += 1
            break
          case 6:
            statistics.TLE += 1
            break
          case 7:
            statistics.MLE += 1
            break
          case 8:
            statistics.OLE += 1
            break
          case 9:z
            statistics.PE += 1
            break
          case 10:
            statistics.SE += 1
            break
        }
      }

      this.statisticsList = Object.entries(statistics).map(([name, value]) => ({ value: value, name: name }))

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