import request from '@/utils/request'

// 查询参数列表
export function getConfigList(query) {
  return request({
    url: '/api/v1/config/list',
    method: 'get',
    params: query
  })
}

// 查询参数详细
export function getConfigDetail(configId) {
  return request({
    url: '/api/v1/config/detail?configId=' + configId,
    method: 'GET'
  })
}

// 根据参数键名查询参数值
export function getConfigKey(configKey) {
  return request({
    url: '/api/v1/config/key?configKey=' + configKey,
    method: 'GET' 
  })
}

// 新增参数配置
export function createConfig(data) {
  return request({
    url: '/api/v1/config/create',
    method: 'POST',
    data: data
  })
}

// 修改参数配置
export function updateConfig(data) {
  return request({
    url: '/api/v1/config/update',
    method: 'PUT',
    data: data
  })
}

// 删除参数配置
export function batchDeleteConfig(data) {
  return request({
    url: '/api/v1/config/delete',
    method: 'delete',
    data: data
  })
}
