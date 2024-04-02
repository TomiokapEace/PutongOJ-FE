<script setup>
import only from 'only'
import { storeToRefs } from 'pinia'
import { onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import constant from '@/util/constant'
import { onRouteQueryUpdate, purify } from '@/util/helper'
import { useSessionStore } from '@/store/modules/session'
import { useSolutionStore } from '@/store/modules/solution'
import { useContestStore } from '@/store/modules/contest'
import { useRootStore } from '@/store'
import { timePretty } from '@/util/formate'
import Chart from 'vue-echarts'
import 'echarts/lib/chart/pie'
import 'echarts/lib/component/title'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/legend'

const { t } = useI18n()
const sessionStore = useSessionStore()
const solutionStore = useSolutionStore()
const contestStore = useContestStore()
const { problems } = $(storeToRefs(contestStore))
const { profile, isAdmin } = $(storeToRefs(sessionStore))
const { list, sum } = $(storeToRefs(solutionStore))
const { find: findSolutions } = solutionStore
const { changeDomTitle } = useRootStore()
const { findOne } = contestStore
const route = useRoute()
const router = useRouter()

let uid = $ref(route.query.uid || '')
let pid = $ref(route.query.pid || '')
let judge = $ref(Number.parseInt(route.query.judge) || '')
let language = $ref(Number.parseInt(route.query.language) || '')
let page = $ref(Number.parseInt(route.query.page) || 1)
let pageSize = $ref(Number.parseInt(route.query.pageSize) || 30)
const mid = $computed(() => route.params.cid || '')

const judgeList = $ref(constant.judgeList)
const languageList = $ref(constant.languageList)
const result = $ref(constant.result)
const lang = $ref(constant.language)
const color = $ref(constant.color)

const query = $computed(() => {
  const opt = Object.assign(
    {},
    only(route.query, 'page pageSize uid pid language judge'),
    {
      mid: route.params.cid,
    },
  )
  if (route.query.pid)
    opt.pid = problems[Number.parseInt(route.query.pid) - 1]

  return purify(opt)
})

const getId = pid => problems.indexOf(pid) + 1

function fetch () {
  findSolutions(query)
  const routeQuery = route.query
  page = Number.parseInt(routeQuery.page) || 1
  pageSize = Number.parseInt(routeQuery.pageSize) || 30
  uid = routeQuery.uid
  pid = routeQuery.pid || ''
  judge = Number.parseInt(routeQuery.judge) || ''
  language = Number.parseInt(routeQuery.language) || ''
}

function reload (payload = {}) {
  router.push({
    name: 'contestStatus',
    query: purify(Object.assign({}, query, payload)),
  })
}

const countList = Array(9).fill(0) // 初始化长度为 9 的 countList，初始值为 0
const showChart = false
function search () {
  // 查询指定题目的提交结果并将结果存储到 countList 中
  reload({
    pid,
  })
  if(pid != 0) {
    showChart = true;
  }
  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    if (item.judge === 2) {
      countList[0]++
    } else if (item.judge === 3) {
      countList[1]++
    } else if (item.judge === 4) {
      countList[2]++
    } else if (item.judge === 5) {
      countList[3]++
    } else if (item.judge === 6) {
      countList[4]++
    } else if (item.judge === 7) {
      countList[5]++
    } else if (item.judge === 8) {
      countList[6]++
    } else if (item.judge === 9) {
      countList[7]++
    } else if (item.judge === 10) {
      countList[8]++
    }
  }
  return reload({
    page: 1,
    uid,
    pid,
    language,
    judge,
  })
}

const pie = $computed(() => {
  const data = {
    title: {
      text: `Statistics`,
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'horizontal',
      x: 'center',
      y: 'bottom',
      data: [ 'CE', 'AC', 'RE', 'WA', 'TLE', 'MLE', 'OLE', 'PE', 'SE' ],
    },
    calculable: true,
    series: [
      {
        name: 'Statistics',
        type: 'pie',
        radius: '55%',
        center: [ '50%', '50%' ],
        data: [
          { value: countList[0] || 0, name: 'CE' },
          { value: countList[1] || 0, name: 'AC' },
          { value: countList[2] || 0, name: 'RE' },
          { value: countList[3] || 0, name: 'WA' },
          { value: countList[4] || 0, name: 'TLE' },
          { value: countList[5] || 0, name: 'MLE' },
          { value: countList[6] || 0, name: 'OLE' },
          { value: countList[7] || 0, name: 'PE' },
          { value: countList[8] || 0, name: 'SE' },
        ],
      },
    ],
  }
  return data
})

const pageChange = val => reload({ page: val })

onBeforeMount(async () => {
  if (problems == null)
    await findOne({ cid: mid })

  fetch()
  changeDomTitle({ title: `Contest ${route.params.cid}` })
})

onRouteQueryUpdate(fetch)
</script>

<template>
  <div>
    <Row class="filter">
      <Col :offset="1" :span="5">
        <Row>
          <Col :span="6">
            <label>User</label>
          </Col>
          <Col :span="15">
            <Input v-model="uid" placeholder="username" />
          </Col>
        </Row>
      </Col>
      <Col :span="4">
        <Row>
          <Col :span="6">
            <label>Pid</label>
          </Col>
          <Col :span="15">
            <Input v-model="pid" placeholder="pid" />
          </Col>
        </Row>
      </Col>
      <Col :span="6">
        <Row>
          <Col :span="6">
            <label>Judge</label>
          </Col>
          <Col :span="16">
            <Select v-model="judge">
              <Option
                v-for="item in judgeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </Select>
          </Col>
        </Row>
      </Col>
      <Col :span="4">
        <Row>
          <Col :span="12">
            <label>Language</label>
          </Col>
          <Col :span="12">
            <Select v-model="language">
              <Option
                v-for="item in languageList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </Select>
          </Col>
        </Row>
      </Col>
      <Col :span="3">
        <Button type="primary" icon="ios-search" @click="search">
          {{ t('oj.search') }}
        </Button>
      </Col>
    </Row>
    <Row class="pagination" type="flex" justify="start">
      <Col :span="16">
        <Page v-model:current="page" :total="sum" :page-size="pageSize" show-elevator @on-change="pageChange" />
      </Col>
    </Row>
    <table>
      <tr>
        <th>SID</th>
        <th>PID</th>
        <th>Username</th>
        <th>Judge</th>
        <th>Time/ms</th>
        <th>Memory/kb</th>
        <th>Language</th>
        <th>Submit Time</th>
      </tr>
      <tr v-for="item in list" :key="item.sid">
        <td>{{ item.sid }}</td>
        <td>
          <router-link :to="{ name: 'contestProblem', params: { cid: mid, id: getId(item.pid) } }">
            {{ getId(item.pid) }}
          </router-link>
        </td>
        <td>
          <Button type="text">
            {{ item.uid }}
          </Button>
        </td>
        <td :class="color[item.judge]">
          {{ result[item.judge] }}
          <Tag v-if="item.sim" color="yellow">
            [{{ item.sim }}%]{{ item.sim_s_id }}
          </Tag>
        </td>
        <td>{{ item.time }}</td>
        <td>{{ item.memory }}</td>
        <td v-if="isAdmin || (profile && profile.uid === item.uid)">
          <router-link :to="{ name: 'solution', params: { sid: item.sid } }">
            {{ lang[item.language] }}
          </router-link>
        </td>
        <td v-else>
          {{ lang[item.language] }}
        </td>
        <td>{{ timePretty(item.create) }}</td>
      </tr>
    </table>
  </div>
  <td v-if="isAdmin">
    <h3>{{ "Status Review" }}</h3>
    <div v-if="showPieChart">
      <Chart ref="pie" :option="pie" auto-resize />
    </div>
  </td>
</template>

<style lang="stylus" scoped>
@import '../../styles/common'

.filter
  margin-bottom: 20px
  label
    height: 32px
    line-height: 32px
  .ivu-col
    text-align: center
    margin-bottom: 0
    font-size: 14px
  .ivu-select-item
    text-align: left
.pagination
  margin-left: 10px
  .ivu-col
    text-align: left
    margin-bottom: 10px
</style>
