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
    dateData: [], // 时间列表
    submitData: [], // 对应时间的提交数列表
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

      // 计算日期列表 dateData
      const currentDate = new Date();
      const dateData = [];

      for (let i = 6; i >= 0; i--) {
        const day = new Date(currentDate.getTime() - i * 24 * 60 * 60 * 1000);
        const formattedDate = `${day.getMonth() + 1}-${day.getDate()}`;
        dateData.push(formattedDate);
      }

      this.dateData = dateData;

      // 设置初始的 submitData 数组长度并填充为0
      const submitData = Array(dateData.length).fill(0);
      const payload2 = {
        uid: payload.uid, // 查询user的提交
        page: 1, // 或者根据需要设置其他的页码
        pageSize: 9999, // 设置一个足够大的 pageSize 来一次性获取所有提交
      }
      const { data: solutionData } = await api.solution.find(payload2); // 获取题目对应的solution列表
      let solutionList = solutionData.list.docs;

      for (let item of solutionList) {
        const timestamp = item.create
        const itemDate = new Date(timestamp);
        const diffDays = 6 - Math.abs(currentDate.getDate() - itemDate.getDate()); // 计算相差天数
        if (diffDays <= 6 && diffDays >= 0) {
          submitData[diffDays]++;
        }
      }
      this.submitData = submitData;

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
