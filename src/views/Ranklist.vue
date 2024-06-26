<script setup>
import { storeToRefs } from 'pinia'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import pick from 'lodash.pick'
import { useI18n } from 'vue-i18n'
import { onRouteQueryUpdate, purify } from '@/util/helper'
import { useRootStore } from '@/store'
import { useRanklistStore } from '@/store/modules/ranklist'
import { useGroupStore } from '@/store/modules/group'
import { formate } from '@/util/formate'
import { reactive, ref } from 'vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const group = $ref('')
const query = $computed(() => {
  const opt = Object.assign(
    {},
    pick(route.query, [ 'page', 'pageSize' ]),
    { gid: group },
  )
  return purify(opt)
})

const page = $computed(() => Number.parseInt(query.page) || 1)
const pageSize = $computed(() => Number.parseInt(query.pageSize) || 30)

const rootStore = useRootStore()
const ranklistStore = useRanklistStore()
const groupStore = useGroupStore()

const { list: groups } = $(storeToRefs(groupStore))
const { judge } = $(storeToRefs(rootStore))
const { list, sum } = $(storeToRefs(ranklistStore))
const groupList = $computed(() => [ { gid: '', title: 'ALL' } ].concat(groups))

function reload (payload = {}) {
  const routeQuery = Object.assign({}, query, payload)
  router.push({ name: 'ranklist', query: routeQuery })
}

async function fetch () {
  ranklistStore.find(query)
  await groupStore.find({ lean: 1 })
}

const pageChange = val => reload({ page: val })
const search = () => reload({ gid: group, page: 1 })

fetch()
onBeforeRouteLeave(() => groupStore.clearSavedGroups())
onRouteQueryUpdate(fetch)
</script>

<template>
  <div class="rank-wrap">
    <Row style="margin-bottom: 20px" type="flex" justify="end">
      <Col :span="1">
        <label>{{ t('oj.group') }}</label>
      </Col>
      <Col :span="3">
        <Select v-model="group">
          <Option v-for="item in groupList" :key="item.gid" :value="item.gid">
            {{ item.title }}
          </Option>
        </Select>
      </Col>
      <Col :span="2">
        <Button type="primary" class="ivu-ml-8" @click="search">
          {{ t('oj.search') }}
        </Button>
      </Col>
    </Row>
    <table>
      <tr>
        <th>Rank</th>
        <th>{{ t('oj.username') }}</th>
        <th>{{ t('oj.nick') }}</th>
        <th>{{ t('oj.motto') }}</th>
        <th>{{ t('oj.solved') }}</th>
        <th>{{ t('oj.submit') }}</th>
        <th>Ratio</th>
      </tr>
      <tr v-for="(item, index) in list" :key="item.uid">
        <td>{{ index + 1 + (page - 1) * pageSize }}</td>
        <td>
          <router-link :to="{ name: 'userInfo', params: { uid: item.uid } }">
            <Button type="text">
              {{ item.uid }}
            </Button>
          </router-link>
        </td>
        <td>{{ item.nick }}</td>
        <td>{{ item.motto }}</td>
        <td>
          <router-link :to="{ name: 'status', query: { uid: item.uid, judge: judge.Accepted } }">
            <Button type="text">
              {{ item.solve }}
            </Button>
          </router-link>
        </td>
        <td>
          <router-link :to="{ name: 'status', query: { uid: item.uid } }">
            <Button type="text">
              {{ item.submit }}
            </Button>
          </router-link>
        </td>
        <td>
          <div class="progress-bar">
            <div class="progress" :style="{ width: `${(item.solve / item.submit) * 100}%` }"></div>
          </div>
        </td>
      </tr>
    </table>
    <Page
      :model-value="page"
      :total="sum"
      :page-size="pageSize"
      show-elevator
      @on-change="pageChange"
    />
  </div>
</template>

<style lang="stylus">
@import '../styles/common'

.rank-wrap
  margin-bottom: 20px
  label
    line-height: 30px
  table
    margin-bottom: 20px
    td
      word-break: break-all
      line-height: 20px
      font-size: 14px
    td:nth-child(4)
      width: 50%
      padding-right: 10px
.progress-bar {
  display: flex;
  height: 20px;
  background-color: #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: #A0D468;
}
</style>
