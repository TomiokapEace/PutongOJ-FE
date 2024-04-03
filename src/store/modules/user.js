import { defineStore } from 'pinia'
import api from '@/api'
import { useProblemStore } from '@/store/modules/problem'

export const useUserStore = defineStore('user', {
  state: () => ({
    registerDialog: false,
    list: [],
    user: {},
    solved: [],
    unsolved: [],
    group: [],
    adminList: [],
    solvedTag: [], // 添加饼图所需的数据 solvedTag
  }),
  actions: {
    register (payload) {
      return api.register(payload)
    },
    async find (payload) {
      const { data } = await api.user.find(payload)
      if (payload)
        this.adminList = data.list
      else
        this.list = data.list
    },
    async findOne (payload) {
      const { data } = await api.user.findOne(payload)
      this.user = data.user
      this.solved = data.solved
      this.unsolved = data.unsolved
      this.group = data.group

      // 在问题存储库中查询标签信息
      const problemStore = useProblemStore()
      await problemStore.find({})

      // 计算饼图所需的数据 solvedTag
      let solvedTagMap = new Map()

      for (let item of problemStore.list) {
        if (this.solved.includes(item.pid)) {
          for (let tag of item.tags) {
            if (solvedTagMap.has(tag)) {
              solvedTagMap.set(tag, solvedTagMap.get(tag) + 1)
            } else {
              solvedTagMap.set(tag, 1)
            }
          }
        }
      }

      this.solvedTag = Array.from(solvedTagMap).map(([name, count]) => ({ value: count, name }))
    },
    update (payoad) {
      return api.user.update(payoad)
    },
    delete (payload) {
      return api.user.delete(payload)
    },
    clearSavedUsers () {
      this.list = []
    },
  },
})
