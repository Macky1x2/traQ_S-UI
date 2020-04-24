import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { entities } from './index'
import apis from '@/lib/apis'
import { reduceToRecord } from '@/lib/util/record'
import {
  FileId,
  TagId,
  MessageId,
  ChannelId,
  ClipFolderId
} from '@/types/entity-ids'

// TODO: リクエストパラメータの型置き場
interface GetMessagesParams {
  channelId: string
  limit?: number
  offset?: number
  since?: Date
  until?: Date
  inclusive?: boolean
  order?: 'asc' | 'desc'
  options?: any
}

interface GetFilesChannelParams {
  channelId: string
  limit?: number
  offset?: number
  since?: Date
  until?: Date
  inclusive?: boolean
  order?: 'asc' | 'desc'
  mine?: boolean
  options?: any
}

export const entitiesActionContext = (context: any) =>
  moduleActionContext(context, entities)

export const actions = defineActions({
  async fetchUser(context, userId: string) {
    const { commit } = entitiesActionContext(context)
    const res = await apis.getUser(userId)
    commit.addUser({ id: userId, entity: res.data })
  },
  async fetchUsers(context) {
    const { commit } = entitiesActionContext(context)
    const res = await apis.getUsers()
    commit.setUsers(reduceToRecord(res.data, 'id'))
  },
  async fetchChannels(context) {
    const { commit } = entitiesActionContext(context)
    const res = await apis.getChannels(true)
    // TODO: DM対応
    if (res.data.public) {
      commit.setChannels(reduceToRecord(res.data.public, 'id'))
    }
  },
  async fetchUserGroups(context) {
    const { commit } = entitiesActionContext(context)
    const res = await apis.getUserGroups()
    commit.setUserGroups(reduceToRecord(res.data, 'id'))
  },
  async fetchStamps(context) {
    const { commit } = entitiesActionContext(context)
    const res = await apis.getStamps()
    commit.setStamps(reduceToRecord(res.data, 'id'))
  },
  async fetchStampPalettes(context) {
    const { commit } = entitiesActionContext(context)
    const res = await apis.getStampPalettes()
    commit.setStampPalettes(reduceToRecord(res.data, 'id'))
  },
  async fetchMessagesByChannelId(context, params: GetMessagesParams) {
    const { commit } = entitiesActionContext(context)
    const res = await apis.getMessages(
      params.channelId,
      params.limit,
      params.offset,
      params.since?.toISOString(),
      params.until?.toISOString(),
      params.inclusive,
      params.order
    )
    commit.extendMessages(reduceToRecord(res.data, 'id'))
    return {
      messages: res.data,
      hasMore: res.headers['x-traq-more'] === 'true'
    }
  },
  async fetchMessage(context, messageId: MessageId) {
    const { commit } = entitiesActionContext(context)
    const res = await apis.getMessage(messageId)
    commit.addMessage({ id: res.data.id, entity: res.data })
    return res.data
  },
  async fetchFileMetaByChannelId(
    context,
    { channelId, limit, offset }: GetFilesChannelParams
  ) {
    const { commit } = entitiesActionContext(context)
    const res = await apis.getFiles(channelId, limit, offset)
    commit.extendFileMetaData(reduceToRecord(res.data, 'id'))
    return {
      messages: res.data,
      hasMore: res.headers['x-traq-more'] === 'true'
    }
  },
  async fetchFileMetaByFileId(context, fileId: FileId) {
    const { commit } = entitiesActionContext(context)
    const res = await apis.getFileMeta(fileId)
    commit.addFileMetaData({ id: res.data.id, entity: res.data })
    return {
      messages: res.data,
      hasMore: res.headers['x-traq-more'] === 'true'
    }
  },
  async fetchTag(context, tagId: TagId) {
    const { commit } = entitiesActionContext(context)
    const res = await apis.getTag(tagId)
    commit.addTags({ id: res.data.id, entity: res.data })
  },
  async createChannel(
    context,
    payload: { name: string; parent: ChannelId | null }
  ) {
    const { commit } = entitiesActionContext(context)
    const res = await apis.createChannel({
      name: payload.name,
      parent: payload.parent
    })
    commit.addChannel({ id: res.data.id, entity: res.data })
    if (res.data.parentId) {
      // 親チャンネルの`children`が不整合になるので再取得
      const parentRes = await apis.getChannel(res.data.parentId)
      commit.addChannel({ id: parentRes.data.id, entity: parentRes.data })
    }
    return res.data
  },
  async fetchClipFolders(context) {
    const { commit } = entitiesActionContext(context)
    const res = await apis.getClipFolders()
    commit.setClipFolders(reduceToRecord(res.data, 'id'))
  },
  async fetchClipFolder(context, id: ClipFolderId) {
    const { commit } = entitiesActionContext(context)
    const res = await apis.getClipFolder(id)
    commit.addClipFolder({ id, entity: res.data })
    return res.data
  }
})
