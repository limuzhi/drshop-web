import request from '@/utils/request'

// 获取操作日志列表
export function getOperLogList(query) {
  return request({
    url: '/api/v1/operLog/list',
    method: 'get',
    params: query
  })
}

// 批量删除操作日志
export function batchDeleteOperlogByIds(data) {
  return request({
    url: '/api/v1/operLog/batchDelete',
    method: 'delete',
    data:data
  })
}

  
// 清空操作日志
export function clearOperlog() {
  return request({
    url: '/api/v1/operLog/clear',
    method: 'delete'
  })
}

