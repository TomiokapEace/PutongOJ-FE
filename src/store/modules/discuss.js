import * as types from '../types'
import api from '@/api'
import { defineStore } from 'pinia'

export const useDiscussStore = defineStore('discuss', {
  state: () => ({
    list: [],
    discuss: {}
  }),
  actions: {
    async findOne (payload) {
      const {data} = await api.discuss.findOne(payload)
      data.discuss.comments = data.discuss.comments.sort((x, y) => x.create - y.create)
      this.discuss = data.discuss
      return data
    },
    async find (payload) {
      const {data} = await api.discuss.find(payload)
      if (data.list != null && Array.isArray(data.list)) {
        data.list = data.list.sort((x, y) => -x.update + y.update)
      }
      this.list = data.list
    },
    update (payload) {
      return api.discuss.update(payload).then(({ data }) => data)
    },
    create (payload) {
      return api.discuss.create(payload).then(({ data }) => data.did)
    },
    async delete (payload) {
      await api.discuss.delete(payload)
      this.list = this.list.filter((p) => p.did !== +(payload.did))
    }
  }
})

const store = {
  namespaced: true,
  state: {
    list: [],
    discuss: {}
  },
  getters: {
    list: state => state.list,
    discuss: state => state.discuss
  },
  mutations: {
    [types.GET_DISCUSS]: (state, payload) => {
      state.discuss = payload
    },
    [types.GET_DISCUSS_LIST]: (state, payload) => {
      state.list = payload
    },
    [types.DELETE_DISCUSS]: (state, {did}) => {
      state.list = state.list.filter((p) => p.did !== +did)
    }
  },
  actions: {
    findOne ({ commit }, payload) {
      return api.discuss.findOne(payload).then(({ data }) => {
        data.discuss.comments = data.discuss.comments.sort((x, y) => x.create - y.create)
        commit(types.GET_DISCUSS, data.discuss)
        return data
      })
    },
    find ({ commit }, payload) {
      return api.discuss.find(payload).then(({ data }) => {
        if (data.list != null && Array.isArray(data.list)) {
          data.list = data.list.sort((x, y) => -x.update + y.update)
        }
        commit(types.GET_DISCUSS_LIST, data.list)
      })
    },
    update ({ commit }, payload) {
      return api.discuss.update(payload).then(({ data }) => {
        return data
      })
    },
    create ({ commit }, payload) {
      return api.discuss.create(payload).then(({ data }) => data.did)
    },
    delete ({ commit }, payload) {
      return api.discuss.delete(payload).then(() => {
        commit(types.DELETE_DISCUSS, payload)
      })
    }
  }
}

export default store
