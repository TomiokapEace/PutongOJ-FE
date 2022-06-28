import type { Axios } from 'axios'
import axios from 'axios'
import urlJoin from 'url-join'
import { useSessionStore } from './store/modules/session'
import type { LoginParam, Profile, TimeResp, WebsiteConfigResp } from './types'

// 设置全局axios默认值
axios.defaults.baseURL = '/api/'
axios.defaults.withCredentials = true
axios.defaults.timeout = 100000 // 100000ms的超时验证
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'
const methods = [ 'get', 'post', 'put', 'delete' ] as const
const instance = {} as {
  [K in (typeof methods)[number]]: Axios[K]
}

let errHandler: null | ((err: any) => void) = null

export function setErrorHandler (handler: typeof errHandler) {
  errHandler = handler
}

// 对异常的基本处理
methods.forEach((key) => {
  const axiosMethod = axios[key]
  type T = Parameters<typeof axiosMethod>
  // A decorator that wraps the passed function and handles errors
  instance[key] = async function (...args: T) { // 闭包给原函数捕获异常
    try {
      const data: {
        data: { profile: Profile | null }
      } = await Reflect.apply(axiosMethod, axios, args)
      if (data.data.profile) {
        useSessionStore().setLoginProfile(data.data.profile)
      }
      return data
    } catch (err) {
      if (errHandler) {
        errHandler(err)
      } else {
        // eslint-disable-next-line no-alert
        window.alert('故障')
      }
      return Promise.reject(new Error('I throw this on purpose'))
    }
  } as Axios[typeof key]
})

const api = {
  // 获取题目提交图表信息
  getStatistics: data => instance.get(`/statistics/${data.pid}`, { params: data }),
  // 获取排名列表
  getRanklist: data => instance.get('/ranklist/list', { params: data }),
  // 图片上传
  getImage: data => instance.post('/submit', data),
  // 获取服务器时间
  getTime: () => instance.get<TimeResp>('/servertime'),
  getWebsiteConfig: () => instance.get<WebsiteConfigResp>('/website'),
  testcase: {
    findOne: data => instance.get(`/testcase/${data.pid}/${data.uuid}`, { params: data }),
    find: data => instance.get(`/testcase/${data.pid}`, { params: data }),
    create: data => instance.post(`/testcase/${data.pid}`, data),
    delete: data => instance.delete(`/testcase/${data.pid}/${data.uuid}`, data),
  },
  user: {
    findOne: data => instance.get(`/user/${data.uid}`, { params: data }),
    find: data => instance.get('/user/list', { params: data }),
    create: data => instance.post('/user', data),
    update: data => instance.put(`/user/${data.uid}`, data),
    delete: data => instance.delete(`/user/${data.uid}`, data),
  },
  solution: {
    findOne: data => instance.get(`/status/${data.sid}`, { params: data }),
    find: data => instance.get('/status/list', { params: data }),
    create: data => instance.post('/status', data),
  },
  problem: {
    findOne: data => instance.get(`/problem/${data.pid}`, { params: data }),
    find: data => instance.get('/problem/list', { params: data }),
    create: data => instance.post('/problem/', data),
    update: data => instance.put(`/problem/${data.pid}`, data),
    delete: data => instance.delete(`/problem/${data.pid}`, data),
  },
  contest: {
    findOne: data => instance.get(`/contest/${data.cid}`, { params: data }),
    find: data => instance.get('/contest/list', { params: data }),
    create: data => instance.post('/contest/', data),
    update: data => instance.put(`/contest/${data.cid}`, data),
    rank: data => instance.get(`/contest/${data.cid}/rank`, { params: data }),
    delete: data => instance.delete(`/contest/${data.cid}`, data),
    verify: data => instance.post(`/contest/${data.cid}/verify`, data),
  },
  news: {
    findOne: data => instance.get(`/news/${data.nid}`, { params: data }),
    find: data => instance.get('/news/list', { params: data }),
    create: data => instance.post('/news/', data),
    update: data => instance.put(`/news/${data.nid}`, data),
    delete: data => instance.delete(`/news/${data.nid}`, data),
  },
  group: {
    findOne: data => instance.get(`/group/${data.gid}`, { params: data }),
    find: data => instance.get('/group/list', { params: data }),
    create: data => instance.post('/group/', data),
    update: data => instance.put(`/group/${data.gid}`, data),
    delete: data => instance.delete(`/group/${data.gid}`, data),
  },
  tag: {
    findOne: data => instance.get(`/tag/${data.tid}`, { params: data }),
    find: data => instance.get('/tag/list', { params: data }),
    create: data => instance.post('/tag/', data),
    update: data => instance.put(`/tag/${data.tid}`, data),
    delete: data => instance.delete(`/tag/${data.tid}`, data),
  },
  session: {
    create: (data: LoginParam) => instance.post<{ profile: Profile }>('/session', data),
    delete: () => instance.delete<{}>('/session'),
    fetch: () => instance.get<{ profile: Profile | null }>('/session'),
  },
  discuss: {
    create: data => instance.post('/discuss', data),
    find: data => instance.get('/discuss/list', { params: data }),
    findOne: data => instance.get(`/discuss/${data.did}`, { params: data }),
    update: data => instance.put(`/discuss/${data.did}`, data),
    delete: data => instance.delete(`/discuss/${data.did}`, data),
  },
}

export default {
  ...api,
  login: api.session.create,
  logout: api.session.delete,
  register: api.user.create,
}

export function semiRestful () {
  instance.put = function (url, ...args) {
    return instance.post(urlJoin(url, '/update'), ...args)
  }
  instance.delete = function (url, ...args) {
    return instance.post(urlJoin(url, '/delete'), ...args)
  }
}
